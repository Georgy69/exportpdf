'use strict';

module.exports = function (parent) {
    const pluginShortName = 'exportpdf';
    console.log(`[${pluginShortName}] Plugin loading...`);

    // -------------------------------------------------------------------------
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // -------------------------------------------------------------------------
    
    function escapeHtml(str) { 
        if (!str && str !== 0) return ''; 
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function generateReportHtml(deviceNode) {
        if (!deviceNode) return '<html><body>No data</body></html>';

        const now = new Date().toLocaleString();
        const name = escapeHtml(deviceNode.name);
        const os = escapeHtml(deviceNode.osdesc || deviceNode.os || 'Unknown');
        const agentVer = escapeHtml(deviceNode.agentVersion || 'N/A');
        const lastConnect = deviceNode.lastConnectTime ? new Date(deviceNode.lastConnectTime).toLocaleString() : 'Never';
        const group = escapeHtml(deviceNode.group || 'No Group');
        
        let ipList = 'N/A';
        if (deviceNode.ipaddr) {
            ipList = Array.isArray(deviceNode.ipaddr) ? deviceNode.ipaddr.join(', ') : escapeHtml(deviceNode.ipaddr);
        }

        const isOnline = deviceNode.conn === 1;
        const statusColor = isOnline ? '#28a745' : '#dc3545';
        const statusText = isOnline ? 'Online' : 'Offline';

        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Device Report: ${name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; width: 30%; }
        .status { color: white; padding: 5px 10px; border-radius: 4px; background-color: ${statusColor}; }
        .footer { margin-top: 40px; font-size: 0.8em; color: #777; text-align: center; }
    </style>
</head>
<body>
    <h1>Отчет: ${name}</h1>
    <table>
        <tr><th>Статус</th><td><span class="status">${statusText}</span></td></tr>
        <tr><th>ОС</th><td>${os}</td></tr>
        <tr><th>Версия агента</th><td>${agentVer}</td></tr>
        <tr><th>IP Адрес</th><td>${ipList}</td></tr>
        <tr><th>Группа</th><td>${group}</td></tr>
        <tr><th>Последнее подключение</th><td>${lastConnect}</td></tr>
    </table>
    <div class="footer">Сгенерировано: ${now}</div>
</body>
</html>`;
    }

    function printReport(deviceNode) {
        const reportHtml = generateReportHtml(deviceNode);
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('Разрешите всплывающие окна для сохранения PDF!');
            return;
        }
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    }

    // -------------------------------------------------------------------------
    // ПЛАГИН
    // -------------------------------------------------------------------------
    const plugin = {};

    plugin[pluginShortName] = {
        // 1. Регистрация вкладки
        registerPluginTab: function () {
            return {
                tabId: pluginShortName,
                tabTitle: '📄 Export PDF'
            };
        },

        // 2. Событие при выборе/обновлении устройства
        onDeviceRefreshEnd: function (parentObj, nodeId, deviceNode) {
            // Проверяем, активна ли наша вкладка сейчас
            if (parentObj.tabIsActive(pluginShortName)) {
                this.renderContent(parentObj, deviceNode);
            }
        },

        // 3. Отрисовка содержимого вкладки
        renderContent: function (parentObj, deviceNode) {
            if (!deviceNode) {
                parentObj.tabContent(pluginShortName, '<p>Нет данных.</p>');
                return;
            }

            // HTML интерфейс вкладки
            const tabHtml = `
                <div style="padding: 20px;">
                    <h3>Экспорт в PDF</h3>
                    <p>Устройство: <strong>${escapeHtml(deviceNode.name)}</strong></p>
                    <button id="btn-export-pdf" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Скачать PDF
                    </button>
                    <div id="export-msg" style="margin-top: 10px; color: green;"></div>
                </div>
            `;

            // Вставляем HTML
            parentObj.tabContent(pluginShortName, tabHtml);

            // Добавляем обработчик клика
            setTimeout(() => {
                const btn = document.getElementById('btn-export-pdf');
                if (btn) {
                    // Удаляем старые слушатели через клонирование
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    newBtn.addEventListener('click', () => {
                        document.getElementById('export-msg').innerText = 'Подготовка...';
                        printReport(deviceNode);
                        document.getElementById('export-msg').innerText = 'Готово! Проверьте окно печати.';
                    });
                }
            }, 100);
        }
    };

    console.log(`[${pluginShortName}] Ready.`);
    return plugin;
};
