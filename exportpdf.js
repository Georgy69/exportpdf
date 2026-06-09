'use strict';

module.exports = function (parent) {
    console.log('[exportpdf] Плагин экспорта в PDF загружен (с отдельной вкладкой)');
    
    // Функция генерации HTML отчета (та же, что и раньше)
    function generateDeviceReportHTML(node) {
        const now = new Date();
        const isOnline = (node.state === 1 || node.conn === 1);
        const statusColor = isOnline ? '#28a745' : '#dc3545';
        
        const escapeHtml = (str) => {
            if (!str && str !== 0) return 'Н/Д';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };
        
        const formatBytes = (bytes) => {
            if (!bytes || bytes === 0) return 'Н/Д';
            const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        };
        
        const formatDate = (timestamp) => {
            if (!timestamp) return 'Н/Д';
            return new Date(timestamp).toLocaleString('ru-RU');
        };
        
        let osType = 'Неизвестно';
        if (node.os || node.osdesc) {
            const osStr = String(node.os || node.osdesc).toLowerCase();
            if (osStr.includes('windows')) osType = 'Windows';
            else if (osStr.includes('linux')) osType = 'Linux';
            else if (osStr.includes('mac')) osType = 'macOS';
        }
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Отчет об устройстве - ${escapeHtml(node.name)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; padding: 20px; background: #f0f2f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; break-inside: avoid; page-break-inside: avoid; }
        .section-title { font-size: 20px; color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px; }
        .info-card { background: #f8f9fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; break-inside: avoid; page-break-inside: avoid; }
        .info-card h3 { color: #1a73e8; font-size: 16px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e1e4e8; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: 600; color: #5f6368; font-size: 13px; }
        .info-value { color: #202124; font-size: 13px; text-align: right; word-break: break-word; max-width: 60%; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${statusColor}; color: white; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 13px; }
        th { background: #e9ecef; font-weight: 600; color: #5f6368; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #5f6368; border-top: 1px solid #e1e4e8; }
        @media print { body { background: white; padding: 0; } .info-card { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Отчет об устройстве</h1>
            <div>Сгенерировано: ${now.toLocaleString('ru-RU')}</div>
        </div>
        <div class="content">
            <div class="section">
                <h2 class="section-title">🔧 Основная информация</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Общие сведения</h3>
                        <div class="info-row"><span class="info-label">Имя устройства:</span><span class="info-value">${escapeHtml(node.name)}</span></div>
                        <div class="info-row"><span class="info-label">Статус:</span><span class="info-value"><span class="status-badge">${isOnline ? 'Онлайн' : 'Оффлайн'}</span></span></div>
                        <div class="info-row"><span class="info-label">Тип устройства:</span><span class="info-value">${osType}</span></div>
                        <div class="info-row"><span class="info-label">ID устройства:</span><span class="info-value">${escapeHtml(node._id || node.id || 'Н/Д')}</span></div>
                    </div>
                    <div class="info-card">
                        <h3>Агент MeshCentral</h3>
                        <div class="info-row"><span class="info-label">Версия агента:</span><span class="info-value">${escapeHtml(node.agentVersion || node.version || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Последнее подключение:</span><span class="info-value">${formatDate(node.lastConnectTime)}</span></div>
                        <div class="info-row"><span class="info-label">Последний IP:</span><span class="info-value">${escapeHtml(node.lastIP || node.ipaddr || 'Н/Д')}</span></div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">💿 Операционная система</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">ОС:</span><span class="info-value">${escapeHtml(node.os || node.osdesc || 'Н/Д')}</span></div>
                    <div class="info-row"><span class="info-label">Версия:</span><span class="info-value">${escapeHtml(node.osver || 'Н/Д')}</span></div>
                    <div class="info-row"><span class="info-label">Архитектура:</span><span class="info-value">${escapeHtml(node.arch || 'Н/Д')}</span></div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">🖥️ Аппаратное обеспечение</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Процессор и память</h3>
                        <div class="info-row"><span class="info-label">Процессор:</span><span class="info-value">${escapeHtml(node.cpu || (node.hardware && node.hardware.cpu) || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">ОЗУ:</span><span class="info-value">${formatBytes(node.ram || (node.hardware && node.hardware.ram))}</span></div>
                    </div>
                    <div class="info-card">
                        <h3>BIOS</h3>
                        <div class="info-row"><span class="info-label">Вендор:</span><span class="info-value">${escapeHtml(node.biosvendor || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Версия:</span><span class="info-value">${escapeHtml(node.biosversion || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Серийный номер:</span><span class="info-value">${escapeHtml(node.serial || 'Н/Д')}</span></div>
                    </div>
                </div>
            </div>
            
            ${node.netif && node.netif.length ? `
            <div class="section">
                <h2 class="section-title">🌐 Сетевые интерфейсы</h2>
                <div class="info-card">
                    <table><thead><tr><th>Интерфейс</th><th>IP адрес</th><th>MAC адрес</th></tr></thead>
                    <tbody>
                        ${node.netif.map(net => `<tr><td>${escapeHtml(net.name)}</td><td>${escapeHtml(net.ip4Address || net.ip4 || net.ip || 'Н/Д')}</td><td>${escapeHtml(net.mac || 'Н/Д')}</td></tr>`).join('')}
                    </tbody>
                    </div>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>Отчет сгенерирован через MeshCentral | ${now.toLocaleString('ru-RU')}</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    // Экспорт через печать
    function exportToPDF(htmlContent) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
            return;
        }
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    }
    
    // Получение данных об устройстве
    function getCurrentDeviceData() {
        return new Promise((resolve) => {
            // Пытаемся получить из глобального состояния
            if (window.parent && window.parent.meshcentral && window.parent.meshcentral.currentDevice) {
                resolve(window.parent.meshcentral.currentDevice);
                return;
            }
            if (window.meshcentral && window.meshcentral.currentDevice) {
                resolve(window.meshcentral.currentDevice);
                return;
            }
            
            // Получаем ID из URL
            const urlParams = new URLSearchParams(window.location.search);
            const deviceId = urlParams.get('id') || urlParams.get('nodeid');
            
            if (deviceId) {
                fetch(`/api/device/${deviceId}`)
                    .then(res => res.json())
                    .then(data => resolve(data))
                    .catch(() => resolve({ name: 'Unknown', state: 1 }));
            } else {
                resolve({ name: 'Unknown', state: 1 });
            }
        });
    }
    
    // Создание интерфейса на вкладке плагинов
    function renderPluginTab(deviceData) {
        const container = document.getElementById('exportpdf');
        if (!container) return;
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Создаем кнопку экспорта
        const exportBtn = document.createElement('button');
        exportBtn.innerHTML = '📄 Экспортировать информацию об устройстве в PDF';
        exportBtn.style.cssText = `
            padding: 12px 24px;
            background: #1a73e8;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 20px;
            transition: background 0.2s;
        `;
        exportBtn.onmouseenter = () => exportBtn.style.background = '#1557b0';
        exportBtn.onmouseleave = () => exportBtn.style.background = '#1a73e8';
        exportBtn.onclick = () => {
            const html = generateDeviceReportHTML(deviceData);
            exportToPDF(html);
        };
        
        // Создаем информационную карточку
        const infoCard = document.createElement('div');
        infoCard.style.cssText = `
            margin: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e1e4e8;
        `;
        infoCard.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #1a73e8;">📄 Экспорт в PDF</h3>
            <p>Нажмите на кнопку ниже, чтобы сохранить подробный отчет об устройстве в формате PDF.</p>
            <p style="margin-top: 10px; color: #5f6368; font-size: 13px;">Отчет будет содержать информацию об ОС, процессоре, памяти, сетевых интерфейсах и других характеристиках.</p>
        `;
        
        container.appendChild(infoCard);
        container.appendChild(exportBtn);
    }
    
    // Плагин
    const plugin = {
        exportpdf: {
            exports: ['exportCurrentDevice'],
            
            // Регистрируем новую вкладку на странице устройства
            registerPluginTab: function(parent) {
                console.log('[exportpdf] Регистрация вкладки плагина');
                return {
                    tabId: 'exportpdf',
                    tabTitle: '📄 Export PDF'
                };
            },
            
            // Хук, который срабатывает при выборе устройства
            onDeviceRefreshEnd: function(parent, dbid, node) {
                console.log('[exportpdf] Устройство выбрано:', node ? node.name : 'unknown');
                
                // Если вкладка уже активна, обновляем ее содержимое
                if (document.getElementById('exportpdf')) {
                    getCurrentDeviceData().then(deviceData => {
                        renderPluginTab(deviceData);
                    });
                }
            },
            
            // Хук при загрузке веб-интерфейса
            onWebUIStartupEnd: function() {
                console.log('[exportpdf] Веб-интерфейс загружен');
                
                // Наблюдаем за появлением вкладки
                const observer = new MutationObserver(() => {
                    const tabContainer = document.getElementById('exportpdf');
                    if (tabContainer && tabContainer.innerHTML === '') {
                        getCurrentDeviceData().then(deviceData => {
                            renderPluginTab(deviceData);
                        });
                    }
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
            },
            
            // Экспорт текущего устройства (вызывается из консоли)
            exportCurrentDevice: function() {
                getCurrentDeviceData().then(deviceData => {
                    if (deviceData && deviceData.name) {
                        const html = generateDeviceReportHTML(deviceData);
                        exportToPDF(html);
                    } else {
                        alert('Не удалось получить данные об устройстве');
                    }
                });
            }
        }
    };
    
    return plugin;
};
