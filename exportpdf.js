'use strict';

module.exports = function (parent) {
    // Имя плагина должно совпадать с shortName в config.json
    const pluginShortName = 'exportpdf';
    console.log(`[${pluginShortName}] Plugin loading...`);

    // -------------------------------------------------------------------------
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // -------------------------------------------------------------------------
    
    // Безопасное экранирование HTML
    function escapeHtml(str) { 
        if (!str && str !== 0) return ''; 
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Генерация красивого HTML отчета
    function generateReportHtml(deviceNode) {
        if (!deviceNode) return '<html><body>No device data</body></html>';

        const now = new Date().toLocaleString();
        const name = escapeHtml(deviceNode.name);
        const os = escapeHtml(deviceNode.osdesc || deviceNode.os || 'Unknown OS');
        const agentVer = escapeHtml(deviceNode.agentVersion || 'N/A');
        const lastConnect = deviceNode.lastConnectTime ? new Date(deviceNode.lastConnectTime).toLocaleString() : 'Never';
        const group = escapeHtml(deviceNode.group || 'No Group');
        
        // Сбор IP адресов (если доступны в объекте deviceNode, обычно они там есть при активном соединении)
        let ipList = 'N/A';
        if (deviceNode.ipaddr) {
            if (Array.isArray(deviceNode.ipaddr)) {
                ipList = deviceNode.ipaddr.join(', ');
            } else {
                ipList = escapeHtml(deviceNode.ipaddr);
            }
        }

        // CSS стили для печати
        const cssStyles = `
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #2980b9; margin-top: 30px; font-size: 1.2em; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; width: 30%; font-weight: bold; }
                tr:hover { background-color: #f5f5f5; }
                .footer { margin-top: 50px; font-size: 0.8em; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; font-weight: bold; }
                .online { background-color: #d4edda; color: #155724; }
                .offline { background-color: #f8d7da; color: #721c24; }
            </style>
        `;

        // Определение статуса
        const isOnline = deviceNode.conn === 1; // Обычно 1 означает онлайн в MeshCentral
        const statusClass = isOnline ? 'online' : 'offline';
        const statusText = isOnline ? 'Online' : 'Offline';

        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Device Report: ${name}</title>
    ${cssStyles}
</head>
<body>
    <h1>Отчет об устройстве: ${name}</h1>
    
    <table>
        <tr>
            <th>Имя устройства</th>
            <td>${name}</td>
        </tr>
        <tr>
            <th>Статус</th>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        </tr>
        <tr>
            <th>Операционная система</th>
            <td>${os}</td>
        </tr>
        <tr>
            <th>Версия агента</th>
            <td>${agentVer}</td>
        </tr>
        <tr>
            <th>IP Адрес(а)</th>
            <td>${ipList}</td>
        </tr>
        <tr>
            <th>Группа</th>
            <td>${group}</td>
        </tr>
        <tr>
            <th>Последнее подключение</th>
            <td>${lastConnect}</td>
        </tr>
    </table>

    <div class="footer">
        Сгенерировано MeshCentral Plugin "Export PDF" | Дата формирования: ${now}
    </div>

    <script>
        // Автоматически вызываем печать при загрузке окна, если нужно
        // window.print(); 
    </script>
</body>
</html>
        `;
    }

    // Функция для открытия окна печати с нашим отчетом
    function printReport(deviceNode) {
        const reportHtml = generateReportHtml(deviceNode);
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (!printWindow) {
            alert('Пожалуйста, разрешите всплывающие окна для этого сайта, чтобы сохранить PDF.');
            return;
        }

        printWindow.document.write(reportHtml);
        printWindow.document.close(); // Важно для завершения загрузки документа
        printWindow.focus();
        
        // Небольшая задержка перед печатью, чтобы стили успели примениться
        setTimeout(() => {
            printWindow.print();
            // Окно не закрываем автоматически, чтобы пользователь мог проверить результат
        }, 500);
    }

    // -------------------------------------------------------------------------
    // ОСНОВНОЙ ОБЪЕКТ ПЛАГИНА
    // -------------------------------------------------------------------------
    const plugin = {};

    plugin[pluginShortName] = {
        // 1. Регистрируем вкладку
        registerPluginTab: function () {
            return {
                tabId: pluginShortName,
                tabTitle: '📄 Export PDF'
            };
        },

        // 2. Хук при выборе устройства
        onDeviceRefreshEnd: function (parentObj, nodeId, deviceNode) {
            // Проверяем, активна ли наша вкладка
            if (parentObj.tabIsActive(pluginShortName)) {
                this.renderContent(parentObj, deviceNode);
            }
        },

        // 3. Отрисовка интерфейса внутри вкладки
        renderContent: function (parentObj, deviceNode) {
            if (!deviceNode) {
                parentObj.tabContent(pluginShortName, '<p>Нет данных об устройстве.</p>');
                return;
            }

            const tabHtml = `
                <div style="padding: 20px; font-family: sans-serif;">
                    <h3>📄 Экспорт данных устройства</h3>
                    <p>Устройство: <strong>${escapeHtml(deviceNode.name)}</strong></p>
                    <p>Нажмите кнопку ниже, чтобы сформировать PDF-отчет с основной информацией.</p>
                    
                    <button id="export-pdf-action-btn" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
                        Создать и скачать PDF
                    </button>
                    
                    <div id="export-status" style="margin-top: 15px; color: #555;"></div>
                </div>
            `;
            
            // Вставляем HTML во вкладку
            parentObj.tabContent(pluginShortName, tabHtml);

            // Добавляем обработчик события
            setTimeout(() => {
                const actionButton = document.getElementById('export-pdf-action-btn');
                if (actionButton) {
                    // Очищаем предыдущие обработчики клонированием узла
                    const newButton = actionButton.cloneNode(true);
                    actionButton.parentNode.replaceChild(newButton, actionButton);
                    
                    newButton.onclick = () => {
                        const statusDiv = document.getElementById('export-status');
                        if (statusDiv) statusDiv.innerHTML = '⏳ Подготовка отчета...';
                        
                        try {
                            printReport(deviceNode);
                            if (statusDiv) statusDiv.innerHTML = '✅ Окно печати открыто. Выберите "Сохранить как PDF".';
                        } catch (e) {
                            console.error(e);
                            if (statusDiv) statusDiv.innerHTML = '❌ Ошибка при генерации отчета.';
                        }
                    };
                }
            }, 100);
        }
    };
    
    console.log(`[${pluginShortName}] Plugin initialized successfully.`);
    return plugin;
};
