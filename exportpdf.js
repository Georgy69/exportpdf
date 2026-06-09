'use strict';

module.exports = function (parent) {
    console.log('[exportpdf] Плагин экспорта в PDF загружен');
    
    // Функция генерации HTML отчета (полная версия)
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
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f0f2f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; break-inside: avoid; }
        .section-title { font-size: 20px; color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .info-card { background: #f8f9fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; break-inside: avoid; }
        .info-card h3 { color: #1a73e8; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e1e4e8; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: 600; color: #5f6368; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${statusColor}; color: white; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; }
        th { background: #e9ecef; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #5f6368; border-top: 1px solid #e1e4e8; }
        @media print { body { background: white; } .info-card { break-inside: avoid; } }
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
                        <div class="info-row"><span class="info-label">Имя:</span><span>${escapeHtml(node.name)}</span></div>
                        <div class="info-row"><span class="info-label">Статус:</span><span class="status-badge">${isOnline ? 'Онлайн' : 'Оффлайн'}</span></div>
                        <div class="info-row"><span class="info-label">Тип:</span><span>${osType}</span></div>
                    </div>
                    <div class="info-card">
                        <h3>Агент</h3>
                        <div class="info-row"><span class="info-label">Версия:</span><span>${escapeHtml(node.agentVersion || node.version || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">Последнее подключение:</span><span>${formatDate(node.lastConnectTime)}</span></div>
                    </div>
                </div>
            </div>
            <div class="section">
                <h2 class="section-title">💿 Операционная система</h2>
                <div class="info-card">
                    <div class="info-row"><span class="info-label">ОС:</span><span>${escapeHtml(node.os || node.osdesc || 'Н/Д')}</span></div>
                    <div class="info-row"><span class="info-label">Версия:</span><span>${escapeHtml(node.osver || 'Н/Д')}</span></div>
                    <div class="info-row"><span class="info-label">Архитектура:</span><span>${escapeHtml(node.arch || 'Н/Д')}</span></div>
                </div>
            </div>
            <div class="section">
                <h2 class="section-title">🖥️ Аппаратное обеспечение</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Процессор и память</h3>
                        <div class="info-row"><span class="info-label">Процессор:</span><span>${escapeHtml(node.cpu || (node.hardware && node.hardware.cpu) || 'Н/Д')}</span></div>
                        <div class="info-row"><span class="info-label">ОЗУ:</span><span>${formatBytes(node.ram || (node.hardware && node.hardware.ram))}</span></div>
                    </div>
                    ${node.biosvendor ? `
                    <div class="info-card">
                        <h3>BIOS</h3>
                        <div class="info-row"><span class="info-label">Вендор:</span><span>${escapeHtml(node.biosvendor)}</span></div>
                        <div class="info-row"><span class="info-label">Версия:</span><span>${escapeHtml(node.biosversion || 'Н/Д')}</span></div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ${node.netif && node.netif.length ? `
            <div class="section">
                <h2 class="section-title">🌐 Сеть</h2>
                <div class="info-card">
                    <table><thead><tr><th>Интерфейс</th><th>IP</th><th>MAC</th></tr></thead>
                    <tbody>
                        ${node.netif.map(net => `<tr><td>${escapeHtml(net.name)}</td><td>${escapeHtml(net.ip4Address || net.ip4 || net.ip || 'Н/Д')}</td><td>${escapeHtml(net.mac || 'Н/Д')}</td></tr>`).join('')}
                    </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>MeshCentral | ${now.toLocaleString('ru-RU')}</p>
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
    
    // Функция для добавления блока на вкладку "Плагины"
    function addToPluginsTab(node) {
        // Ищем контейнер вкладки "Плагины"
        const pluginsTab = document.getElementById('pluginsTab');
        if (!pluginsTab) {
            console.log('[exportpdf] Вкладка "Плагины" не найдена');
            return;
        }
        
        // Ищем контейнер, где ScriptTask отображает свой интерфейс
        // или создаем свой блок в начале вкладки
        let container = document.querySelector('#pluginsTab .exportpdf-container');
        
        if (!container) {
            // Создаем блок для плагина
            container = document.createElement('div');
            container.className = 'exportpdf-container';
            container.style.cssText = 'margin: 15px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd;';
            
            // Вставляем в начало вкладки "Плагины"
            if (pluginsTab.firstChild) {
                pluginsTab.insertBefore(container, pluginsTab.firstChild);
            } else {
                pluginsTab.appendChild(container);
            }
        }
        
        // Отрисовываем интерфейс
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #1a73e8;">📄 Экспорт в PDF</h3>
                    <p style="margin: 0; color: #5f6368; font-size: 13px;">Сохраните информацию об устройстве "${escapeHtml(node.name)}" в PDF</p>
                </div>
                <button id="exportpdf-btn" style="
                    padding: 8px 16px;
                    background: #1a73e8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    📄 Экспортировать
                </button>
            </div>
        `;
        
        // Добавляем обработчик
        const btn = document.getElementById('exportpdf-btn');
        if (btn) {
            btn.onclick = () => {
                const html = generateDeviceReportHTML(node);
                exportToPDF(html);
            };
        }
        
        console.log('[exportpdf] Блок добавлен на вкладку "Плагины"');
    }
    
    // Получение данных устройства (через API при необходимости)
    function enrichDeviceData(node, callback) {
        // Если данных достаточно, возвращаем как есть
        if (node.cpu && node.netif) {
            callback(node);
            return;
        }
        
        // Пробуем получить расширенные данные через API
        const nodeId = node._id || node.id;
        if (nodeId) {
            fetch(`/api/device/${nodeId}`)
                .then(res => res.json())
                .then(fullData => callback(fullData))
                .catch(() => callback(node));
        } else {
            callback(node);
        }
    }
    
    // Плагин
    const plugin = {
        exportpdf: {
            // Хук при выборе устройства
            onDeviceRefreshEnd: function(parent, dbid, node) {
                console.log('[exportpdf] Устройство выбрано:', node ? node.name : 'unknown');
                
                if (node) {
                    // Обогащаем данные и добавляем блок на вкладку "Плагины"
                    enrichDeviceData(node, (enrichedNode) => {
                        setTimeout(() => {
                            addToPluginsTab(enrichedNode);
                        }, 500); // Небольшая задержка для загрузки вкладки
                    });
                }
            },
            
            // Хук при загрузке веб-интерфейса
            onWebUIStartupEnd: function() {
                console.log('[exportpdf] Веб-интерфейс загружен');
            }
        }
    };
    
    return plugin;
};
