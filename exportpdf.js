'use strict';

module.exports = function (parent) {
    // Имя плагина должно совпадать с shortName в config.json
    const pluginShortName = 'exportpdf';
    console.log(`[${pluginShortName}] Plugin loading...`);

    // -------------------------------------------------------------------------
    // ФУНКЦИЯ ГЕНЕРАЦИИ ОТЧЕТА (скопируйте сюда ваш красивый HTML из прошлого сообщения)
    // -------------------------------------------------------------------------
    function generateReportHtml(deviceNode) {
        // Это упрощенный пример. Вставьте сюда ваш полный код генерации HTML отчета.
        // Он должен возвращать строку с полным HTML документом для печати.
        return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Device Report</title></head>
        <body>
            <h1>Device: ${escapeHtml(deviceNode.name)}</h1>
            <p>OS: ${escapeHtml(deviceNode.os || deviceNode.osdesc || 'N/A')}</p>
            <p>Agent Version: ${escapeHtml(deviceNode.agentVersion || 'N/A')}</p>
            <p>Last Connect: ${new Date(deviceNode.lastConnectTime).toLocaleString()}</p>
        </body>
        </html>
        `;
        
        function escapeHtml(str) { if (!str) return ''; return String(str).replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m;}); }
    }

    // Функция для открытия окна печати с нашим отчетом
    function printReport(deviceNode) {
        const reportHtml = generateReportHtml(deviceNode);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Пожалуйста, разрешите всплывающие окна для этого сайта, чтобы сохранить PDF.');
            return;
        }
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // Не закрываем окно сразу, пользователь может захотеть сохранить файл
        // setTimeout(() => printWindow.close(), 1000); 
    }

    // -------------------------------------------------------------------------
    // ОСНОВНОЙ ОБЪЕКТ ПЛАГИНА
    // -------------------------------------------------------------------------
    const plugin = {};

    // Инициализируем свойство плагина. Имя свойства должно совпадать с shortName.
    plugin[pluginShortName] = {
        // 1. Регистрируем вкладку. Именно так создается новая вкладка на странице устройства.
        registerPluginTab: function () {
            console.log(`[${pluginShortName}] Registering plugin tab.`);
            return {
                tabId: pluginShortName,
                tabTitle: '📄 Export PDF' // Название вкладки
            };
        },

        // 2. Этот хук вызывается каждый раз, когда выбрано устройство (node).
        onDeviceRefreshEnd: function (parentObj, nodeId, deviceNode) {
            console.log(`[${pluginShortName}] Device selected: ${deviceNode ? deviceNode.name : nodeId}`);
            
            // Важно: Проверяем, активна ли наша вкладка в данный момент.
            // Метод tabIsActive предоставляется MeshCentral.
            if (parentObj.tabIsActive(pluginShortName)) {
                // Если наша вкладка активна, отрисовываем в ней интерфейс.
                this.renderContent(parentObj, deviceNode);
            }
        },

        // Функция для отрисовки интерфейса внутри НАШЕЙ вкладки
        renderContent: function (parentObj, deviceNode) {
            // Генерируем HTML для вкладки. Это НЕ HTML отчета, а интерфейс плагина.
            const tabHtml = `
                <div style="padding: 20px; text-align: center;">
                    <h2>📄 Экспорт данных устройства</h2>
                    <p>Устройство: <strong>${escapeHtml(deviceNode.name)}</strong></p>
                    <p>Нажмите кнопку ниже, чтобы сгенерировать PDF-отчет.</p>
                    <button id="export-pdf-action-btn" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 4px;">
                        Создать и скачать PDF
                    </button>
                    <div id="export-status" style="margin-top: 15px;"></div>
                </div>
            `;
            
            // Ключевой момент: Вставляем наш HTML во вкладку с помощью parentObj.tabContent
            parentObj.tabContent(pluginShortName, tabHtml);

            // Теперь, когда HTML вставлен, можно добавить обработчик на кнопку.
            // Используем setTimeout, чтобы дать браузеру время отрисовать DOM.
            setTimeout(() => {
                const actionButton = document.getElementById('export-pdf-action-btn');
                if (actionButton) {
                    // Убираем старые обработчики, чтобы не было дублирования
                    const newButton = actionButton.cloneNode(true);
                    actionButton.parentNode.replaceChild(newButton, actionButton);
                    
                    newButton.onclick = () => {
                        console.log(`[${pluginShortName}] Export button clicked for ${deviceNode.name}`);
                        // Показываем статус в интерфейсе плагина
                        const statusDiv = document.getElementById('export-status');
                        if (statusDiv) statusDiv.innerHTML = '<p>⏳ Генерация отчета...</p>';
                        
                        // Запускаем процесс печати (который откроет окно сохранения PDF)
                        printReport(deviceNode);
                        
                        if (statusDiv) statusDiv.innerHTML = '<p>✅ Отчет сгенерирован. Если окно не открылось, проверьте настройки блокировки всплывающих окон.</p>';
                    };
                }
            }, 100);
        }
    };
    
    // Небольшая вспомогательная функция для экранирования HTML
    function escapeHtml(str) { 
        if (!str) return ''; 
        return String(str).replace(/[&<>]/g, function(m) { 
            if (m === '&') return '&amp;'; 
            if (m === '<') return '&lt;'; 
            if (m === '>') return '&gt;'; 
            return m;
        });
    }

    console.log(`[${pluginShortName}] Plugin initialized successfully.`);
    return plugin;
};
