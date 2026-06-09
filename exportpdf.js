'use strict';

module.exports = function (parent) {
    console.log('[exportpdf] Плагин экспорта в PDF загружен (v1.2.0 compatible)');
    
    // Функция генерации HTML отчета
    function generateDeviceReportHTML(node) {
        const now = new Date();
        const isOnline = node.state === 1;
        const statusColor = isOnline ? '#28a745' : '#dc3545';
        
        const escapeHtml = (str) => {
            if (!str) return 'Н/Д';
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
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Информация об устройстве - ${escapeHtml(node.name)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; break-inside: avoid; page-break-inside: avoid; }
        .section-title { font-size: 20px; color: #333; border-bottom: 3px solid #667eea; padding-bottom: 8px; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .info-card { background: #f8f9fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; break-inside: avoid; page-break-inside: avoid; }
        .info-card h3 { color: #667eea; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e1e4e8; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: 600; color: #6c757d; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${statusColor}; color: white; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; }
        th { background: #e9ecef; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #6c757d; border-top: 1px solid #e1e4e8; }
        @media print { body { background: white; } .info-card { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Отчет об устройстве</h1>
            <div>Дата: ${now.toLocaleString('ru-RU')}</div>
        </div>
        <div class="content">
            <div class="section">
                <h2 class="section-title">🔧 Основная информация</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Общее</h3>
                        <div class="info-row"><span class="info-label">Имя:</span><span>${escapeHtml(node.name)}</span></div>
                        <div class="info-row"><span class="info-label">Статус:</span><span class="status-badge">${isOnline ? 'Онлайн' : 'Оффлайн'}</span></div>
                        <div class="info-row"><span class="info-label">Тип:</span><span>${node.type === 1 ? 'Windows' : node.type === 2 ? 'Linux' : node.type === 3 ? 'macOS' : 'Другое'}</span></div>
                        <div class="info-row"><span class="info-label">ID:</span><span>${escapeHtml(node._id || node.id || 'Н/Д')}</span></div>
                    </div>
                    <div class="info-card">
                        <h3>Система</h3>
                        <div class="info-row"><span class="info-label">ОС:</span><span>${escapeHtml(node.os || node.osdesc || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Хостнейм:</span><span>${escapeHtml(node.hostname || node.name)}</span></div>
                        <div class="info-row"><span class="info-label">Agent версия:</span><span>${escapeHtml(node.agentVersion || node.version || 'Н/Д')}</span></div>
                    </div>
                </div>
            </div>
            ${node.hardware ? `
            <div class="section">
                <h2 class="section-title">💻 Аппаратное обеспечение</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Процессор и память</h3>
                        <div class="info-row"><span class="info-label">Процессор:</span><span>${escapeHtml(node.hardware.cpu || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">ОЗУ:</span><span>${formatBytes(node.hardware.ram)}</span></div>
                        ${node.hardware.manufacturer ? `<div class="info-row"><span class="info-label">Производитель:</span><span>${escapeHtml(node.hardware.manufacturer)}</span></div>` : ''}
                        ${node.hardware.model ? `<div class="info-row"><span class="info-label">Модель:</span><span>${escapeHtml(node.hardware.model)}</span></div>` : ''}
                        ${node.hardware.serial ? `<div class="info-row"><span class="info-label">Серийный номер:</span><span>${escapeHtml(node.hardware.serial)}</span></div>` : ''}
                    </div>
                </div>
            </div>
            ` : ''}
            ${node.diskinfo && node.diskinfo.length ? `
            <div class="section">
                <h2 class="section-title">💾 Диски</h2>
                <div class="info-card">
                    <table><thead><tr><th>Диск</th><th>Всего</th><th>Использовано</th><th>Свободно</th><th>%</th></tr></thead><tbody>
                    ${node.diskinfo.map(disk => {
                        const total = formatBytes(disk.total);
                        const used = formatBytes(disk.used);
                        const free = formatBytes(disk.free);
                        const percent = disk.total ? ((disk.used / disk.total) * 100).toFixed(1) : 0;
                        return `<tr><td>${escapeHtml(disk.name || disk.mount || 'Н/Д')}</td><td>${total}</td><td>${used}</td><td>${free}</td><td>${percent}%</td></tr>`;
                    }).join('')}
                    </tbody></table>
                </div>
            </div>
            ` : ''}
            ${node.netif && node.netif.length ? `
            <div class="section">
                <h2 class="section-title">🌐 Сеть</h2>
                <div class="info-card">
                    <table><thead><tr><th>Интерфейс</th><th>IP адрес</th><th>MAC адрес</th></tr></thead><tbody>
                    ${node.netif.map(net => `<tr><td>${escapeHtml(net.name)}</td><td>${escapeHtml(net.ip4Address || net.ip4 || net.ip || 'Н/Д')}</td><td>${escapeHtml(net.mac || 'Н/Д')}</td></tr>`).join('')}
                    </tbody></table>
                </div>
            </div>
            ` : ''}
            <div class="section">
                <h2 class="section-title">⏱️ Активность</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">Последнее подключение:</span><span>${formatDate(node.lastConnectTime)}</span></div>
                    <div class="info-row"><span class="info-label">Последнее отключение:</span><span>${formatDate(node.lastDisconnectTime)}</span></div>
                    ${node.regTime ? `<div class="info-row"><span class="info-label">Дата регистрации:</span><span>${formatDate(node.regTime)}</span></div>` : ''}
                </div>
            </div>
        </div>
        <div class="footer">
            <p>Отчет сгенерирован через MeshCentral Plugin Export to PDF | ${now.toLocaleString('ru-RU')}</p>
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
    
    // Получение данных устройства из MeshCentral
    function getDeviceDataFromMeshCentral() {
        return new Promise((resolve) => {
            // Способ 1: Глобальный объект MeshCentral
            if (window.parent && window.parent.meshcentral && window.parent.meshcentral.currentDevice) {
                resolve(window.parent.meshcentral.currentDevice);
                return;
            }
            if (window.meshcentral && window.meshcentral.currentDevice) {
                resolve(window.meshcentral.currentDevice);
                return;
            }
            
            // Способ 2: Из URL параметров
            const urlParams = new URLSearchParams(window.location.search);
            const deviceId = urlParams.get('id') || urlParams.get('nodeid');
            
            if (deviceId) {
                // Через API
                fetch(`/api/device/${deviceId}`)
                    .then(res => res.json())
                    .then(data => resolve(data))
                    .catch(() => resolve(collectDataFromDOM()));
            } else {
                resolve(collectDataFromDOM());
            }
        });
    }
    
    function collectDataFromDOM() {
        const data = {
            name: 'Неизвестное устройство',
            state: 1,
            type: 0,
            _id: 'unknown',
            lastConnectTime: Date.now()
        };
        
        const nameEl = document.querySelector('.deviceDetailsName, .device-name, h1');
        if (nameEl) data.name = nameEl.textContent.trim();
        
        const statusEl = document.querySelector('.deviceStatus, .status');
        if (statusEl) data.state = statusEl.textContent.includes('Онлайн') || statusEl.textContent.includes('Online') ? 1 : 0;
        
        return data;
    }
    
    // Плагин
    const plugin = {
        exportpdf: {
            exports: ['exportCurrentDevice'],
            
            // Хук для версии 1.2.0 (срабатывает после загрузки веб-интерфейса)
            onWebUIStartupEnd: function() {
                console.log('[exportpdf] WebUI загружен, добавляем кнопку');
                this.addExportButton();
            },
            
            addExportButton: function() {
                let attempts = 0;
                const maxAttempts = 20;
                
                const checkAndAdd = setInterval(() => {
                    attempts++;
                    
                    // Ищем тулбар на странице устройства
                    const toolbar = document.querySelector('.deviceDetailsToolbar, .device-toolbar, .MuiToolbar-root, [class*="toolbar"]');
                    const devicePage = document.querySelector('.deviceDetailsPage, [class*="deviceDetails"]');
                    
                    if ((toolbar || devicePage) && !document.getElementById('exportpdf-btn')) {
                        const targetToolbar = toolbar || devicePage;
                        const btn = document.createElement('button');
                        btn.id = 'exportpdf-btn';
                        btn.innerHTML = '📄 Экспорт в PDF';
                        btn.style.cssText = 'margin-left: 10px; padding: 6px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
                        btn.onmouseover = () => btn.style.transform = 'scale(1.02)';
                        btn.onmouseout = () => btn.style.transform = 'scale(1)';
                        btn.onclick = () => {
                            getDeviceDataFromMeshCentral().then(deviceData => {
                                if (deviceData && deviceData.name) {
                                    const html = generateDeviceReportHTML(deviceData);
                                    exportToPDF(html);
                                } else {
                                    alert('Не удалось получить данные об устройстве');
                                }
                            });
                        };
                        targetToolbar.appendChild(btn);
                        console.log('[exportpdf] Кнопка успешно добавлена');
                        clearInterval(checkAndAdd);
                    }
                    
                    if (attempts >= maxAttempts) {
                        console.log('[exportpdf] Не удалось найти тулбар, кнопка не добавлена');
                        clearInterval(checkAndAdd);
                    }
                }, 500);
            },
            
            exportCurrentDevice: function() {
                getDeviceDataFromMeshCentral().then(deviceData => {
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
