'use strict';

module.exports = function (parent) {
    console.log('[exportpdf] Плагин экспорта в PDF загружен (адаптирован под ваш интерфейс)');
    
    // Функция генерации HTML отчета на основе данных из вашего интерфейса
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
            const d = new Date(timestamp);
            return d.toLocaleString('ru-RU');
        };
        
        // Определяем тип ОС
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
        body { 
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; 
            padding: 20px; 
            background: #f0f2f5; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header .subtitle { opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; break-inside: avoid; page-break-inside: avoid; }
        .section-title { 
            font-size: 20px; 
            color: #1a73e8; 
            border-bottom: 3px solid #1a73e8; 
            padding-bottom: 8px; 
            margin-bottom: 20px;
        }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px; }
        .info-card { 
            background: #f8f9fa; 
            border: 1px solid #e1e4e8; 
            border-radius: 8px; 
            padding: 20px; 
            break-inside: avoid; 
            page-break-inside: avoid;
        }
        .info-card h3 { 
            color: #1a73e8; 
            font-size: 16px; 
            margin-bottom: 15px; 
            padding-bottom: 8px; 
            border-bottom: 2px solid #e1e4e8;
        }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: 600; color: #5f6368; font-size: 13px; }
        .info-value { color: #202124; font-size: 13px; text-align: right; word-break: break-word; max-width: 60%; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${statusColor}; color: white; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 13px; }
        th { background: #e9ecef; font-weight: 600; color: #5f6368; }
        td { background: white; }
        .footer { 
            background: #f8f9fa; 
            padding: 15px; 
            text-align: center; 
            font-size: 11px; 
            color: #5f6368; 
            border-top: 1px solid #e1e4e8;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; border-radius: 0; }
            .info-card { break-inside: avoid; page-break-inside: avoid; }
            .section { break-inside: avoid; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Отчет об устройстве</h1>
            <div class="subtitle">Сгенерировано: ${now.toLocaleString('ru-RU')}</div>
        </div>
        
        <div class="content">
            <!-- Основная информация -->
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
                        <div class="info-row"><span class="info-label">Последний IP адрес:</span><span class="info-value">${escapeHtml(node.lastIP || node.ipaddr || 'Н/Д')}</span></div>
                    </div>
                </div>
            </div>
            
            <!-- Операционная система -->
            <div class="section">
                <h2 class="section-title">💿 Операционная система</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Сведения об ОС</h3>
                        <div class="info-row"><span class="info-label">Имя:</span><span class="info-value">${escapeHtml(node.os || node.osdesc || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Версия:</span><span class="info-value">${escapeHtml(node.osver || node.version || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Архитектура:</span><span class="info-value">${escapeHtml(node.arch || node.osarch || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Рабочая группа/Домен:</span><span class="info-value">${escapeHtml(node.domain || node.workgroup || 'Н/Д')}</span></div>
                    </div>
                    ${node.lastBootTime ? `
                    <div class="info-card">
                        <h3>Время работы</h3>
                        <div class="info-row"><span class="info-label">Последняя загрузка:</span><span class="info-value">${formatDate(node.lastBootTime)}</span></div>
                        <div class="info-row"><span class="info-label">Время работы:</span><span class="info-value">${node.uptime ? Math.floor(node.uptime / 3600) + ' ч ' + Math.floor((node.uptime % 3600) / 60) + ' мин' : 'Н/Д'}</span></div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Аппаратное обеспечение -->
            <div class="section">
                <h2 class="section-title">🖥️ Аппаратное обеспечение</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Процессор и память</h3>
                        <div class="info-row"><span class="info-label">Процессор:</span><span class="info-value">${escapeHtml(node.cpu || (node.hardware && node.hardware.cpu) || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Оперативная память:</span><span class="info-value">${formatBytes(node.ram || (node.hardware && node.hardware.ram))}</span></div>
                    </div>
                    <div class="info-card">
                        <h3>BIOS</h3>
                        <div class="info-row"><span class="info-label">Вендор:</span><span class="info-value">${escapeHtml(node.biosvendor || (node.hardware && node.hardware.biosvendor) || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Версия:</span><span class="info-value">${escapeHtml(node.biosversion || (node.hardware && node.hardware.biosversion) || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Серийный номер:</span><span class="info-value">${escapeHtml(node.serial || (node.hardware && node.hardware.serial) || 'Н/Д')}</span></div>
                    </div>
                </div>
            </div>
            
            <!-- Сеть -->
            ${node.netif && node.netif.length ? `
            <div class="section">
                <h2 class="section-title">🌐 Сетевые интерфейсы</h2>
                <div class="info-card">
                    <table>
                        <thead><tr><th>Интерфейс</th><th>IP адрес</th><th>MAC адрес</th><th>Скорость</th></tr></thead>
                        <tbody>
                            ${node.netif.map(net => `<tr>
                                <td>${escapeHtml(net.name)}</td>
                                <td>${escapeHtml(net.ip4Address || net.ip4 || net.ip || 'Н/Д')}</td>
                                <td>${escapeHtml(net.mac || 'Н/Д')}</td>
                                <td>${net.speed ? net.speed + ' Mbps' : 'Н/Д'}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- DNS Серверы -->
            ${node.dns || (node.netif && node.netif[0] && node.netif[0].dns) ? `
            <div class="section">
                <h2 class="section-title">🌐 DNS Серверы</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">DNS серверы:</span><span class="info-value">${escapeHtml(node.dns || (node.netif[0] && node.netif[0].dns) || 'Н/Д')}</span></div>
                </div>
            </div>
            ` : ''}
            
            <!-- Материнская плата -->
            ${node.board || (node.hardware && node.hardware.board) ? `
            <div class="section">
                <h2 class="section-title">🔧 Материнская плата</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">Производитель:</span><span class="info-value">${escapeHtml(node.board || (node.hardware && node.hardware.board))}</span></div>
                    <div class="info-row"><span class="info-label">Модель:</span><span class="info-value">${escapeHtml(node.boardmodel || (node.hardware && node.hardware.boardmodel) || 'Н/Д')}</span></div>
                </div>
            </div>
            ` : ''}
            
            <!-- Дополнительная информация -->
            ${node.desc || node.comment ? `
            <div class="section">
                <h2 class="section-title">📝 Примечания</h2>
                <div class="info-card">
                    <p>${escapeHtml(node.desc || node.comment)}</p>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Отчет сгенерирован через MeshCentral Plugin Export to PDF | ${now.toLocaleString('ru-RU')}</p>
            <p>iteams.ru | Система управления удаленными устройствами</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    // Функция экспорта через печать
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
    function getDeviceData() {
        return new Promise((resolve) => {
            // Пытаемся получить данные из глобального состояния
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
                // Запрашиваем через API
                fetch(`/api/device/${deviceId}`)
                    .then(res => res.json())
                    .then(data => resolve(data))
                    .catch(() => resolve(buildDataFromDOM()));
            } else {
                resolve(buildDataFromDOM());
            }
        });
    }
    
    // Сбор данных из DOM (резервный вариант)
    function buildDataFromDOM() {
        const data = { name: 'Неизвестное устройство', state: 1 };
        
        // Имя устройства
        const nameEl = document.querySelector('h1, .device-name, .deviceDetailsName');
        if (nameEl) data.name = nameEl.textContent.trim();
        
        // Статус
        const statusEl = document.querySelector('.device-status, .status');
        if (statusEl) {
            data.state = statusEl.textContent.includes('Онлайн') ? 1 : 0;
        }
        
        // ОС
        const osEl = document.querySelector('[data-os], .os-info');
        if (osEl) data.os = osEl.textContent;
        
        return data;
    }
    
    // Добавление кнопки на страницу
    function addExportButton() {
        let attempts = 0;
        const maxAttempts = 30;
        
        const findToolbar = setInterval(() => {
            attempts++;
            
            // Ищем тулбар или контейнер вкладок
            const toolbarSelectors = [
                '.device-toolbar',
                '.deviceDetailsToolbar', 
                '.MuiToolbar-root',
                '.tab-bar',
                '.device-header',
                '#device-header'
            ];
            
            let toolbar = null;
            for (const selector of toolbarSelectors) {
                toolbar = document.querySelector(selector);
                if (toolbar) break;
            }
            
            // Если тулбар не найден, ищем панель с вкладками
            if (!toolbar) {
                const tabBar = document.querySelector('.tab-bar, .tabs, [role="tablist"]');
                if (tabBar && tabBar.parentElement) {
                    toolbar = tabBar.parentElement;
                }
            }
            
            if (toolbar && !document.getElementById('exportpdf-btn')) {
                const btn = document.createElement('button');
                btn.id = 'exportpdf-btn';
                btn.innerHTML = '📄 Экспорт в PDF';
                btn.style.cssText = `
                    margin-left: 10px;
                    padding: 6px 14px;
                    background: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                `;
                btn.onmouseenter = () => btn.style.background = '#1557b0';
                btn.onmouseleave = () => btn.style.background = '#1a73e8';
                btn.onclick = () => {
                    getDeviceData().then(deviceData => {
                        if (deviceData && deviceData.name) {
                            const html = generateDeviceReportHTML(deviceData);
                            exportToPDF(html);
                        } else {
                            alert('Не удалось получить данные об устройстве');
                        }
                    });
                };
                
                toolbar.appendChild(btn);
                console.log('[exportpdf] Кнопка экспорта добавлена');
                clearInterval(findToolbar);
            }
            
            if (attempts >= maxAttempts) {
                console.log('[exportpdf] Тулбар не найден после ' + maxAttempts + ' попыток');
                clearInterval(findToolbar);
            }
        }, 500);
    }
    
    // Плагин
    const plugin = {
        exportpdf: {
            exports: ['exportCurrentDevice'],
            
            onWebUIStartupEnd: function() {
                console.log('[exportpdf] Веб-интерфейс загружен, инициализация...');
                setTimeout(() => addExportButton(), 1000);
            },
            
            exportCurrentDevice: function() {
                getDeviceData().then(deviceData => {
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
