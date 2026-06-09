'use strict';

module.exports = function (parent) {
    let myparent = parent;
    
    console.log('[exportpdf] Плагин экспорта в PDF загружен (без зависимостей)');
    
    // Функция для генерации HTML отчета
    function generateDeviceReportHTML(node) {
        const now = new Date();
        
        // Определяем статус устройства
        const isOnline = node.state === 1;
        const statusText = isOnline ? 'Онлайн' : 'Оффлайн';
        const statusColor = isOnline ? '#28a745' : '#dc3545';
        
        // Форматируем даты
        const formatDate = (timestamp) => {
            if (!timestamp) return 'Н/Д';
            return new Date(timestamp).toLocaleString('ru-RU');
        };
        
        // Форматируем размеры
        const formatBytes = (bytes) => {
            if (!bytes || bytes === 0) return 'Н/Д';
            const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        };
        
        // Экранирование HTML
        const escapeHtml = (str) => {
            if (!str) return 'Н/Д';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };
        
        // Получаем информацию об ОС
        const osInfo = node.os || node.osdesc || node.platform || 'Н/Д';
        
        // Получаем информацию о процессоре
        let cpuInfo = 'Н/Д';
        let ramInfo = 'Н/Д';
        if (node.hardware) {
            cpuInfo = node.hardware.cpu || node.hardware.processor || 'Н/Д';
            ramInfo = formatBytes(node.hardware.ram) || formatBytes(node.hardware.memory) || 'Н/Д';
        }
        
        // Тип устройства
        const deviceTypes = {
            0: 'Неизвестно',
            1: 'Windows',
            2: 'Linux',
            3: 'macOS',
            4: 'Android',
            5: 'iOS',
            6: 'Docker',
            7: 'VMware',
            8: 'Hyper-V'
        };
        const deviceType = deviceTypes[node.type] || 'Другое';
        
        // Генерируем HTML
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Информация об устройстве - ${escapeHtml(node.name)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background: ${statusColor};
            color: white;
        }
        
        .section {
            margin-bottom: 30px;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 8px;
            margin-bottom: 20px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .info-card {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .info-card h3 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e1e4e8;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-label {
            font-weight: 600;
            color: #6c757d;
            font-size: 13px;
        }
        
        .info-value {
            color: #212529;
            font-size: 13px;
            word-break: break-word;
            text-align: right;
            max-width: 60%;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        th, td {
            border: 1px solid #dee2e6;
            padding: 10px;
            text-align: left;
            font-size: 13px;
        }
        
        th {
            background: #e9ecef;
            font-weight: 600;
            color: #495057;
        }
        
        td {
            background: white;
        }
        
        .tag {
            display: inline-block;
            background: #e9ecef;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            margin: 3px;
            color: #495057;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            font-size: 11px;
            color: #6c757d;
            border-top: 1px solid #e1e4e8;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .report-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .info-card {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>📊 Отчет об устройстве</h1>
            <div class="subtitle">Дата генерации: ${now.toLocaleString('ru-RU')}</div>
        </div>
        
        <div class="content">
            <!-- Основная информация -->
            <div class="section">
                <h2 class="section-title">🔧 Основная информация</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Общая информация</h3>
                        <div class="info-row">
                            <span class="info-label">Имя устройства:</span>
                            <span class="info-value">${escapeHtml(node.name)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Статус:</span>
                            <span class="info-value"><span class="status-badge">${statusText}</span></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Тип устройства:</span>
                            <span class="info-value">${deviceType}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ID устройства:</span>
                            <span class="info-value">${escapeHtml(node._id || node.id || 'Н/Д')}</span>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h3>Системная информация</h3>
                        <div class="info-row">
                            <span class="info-label">Операционная система:</span>
                            <span class="info-value">${escapeHtml(osInfo)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Хостнейм:</span>
                            <span class="info-value">${escapeHtml(node.hostname || node.name)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Mesh Agent версия:</span>
                            <span class="info-value">${escapeHtml(node.agentVersion || node.version || 'Н/Д')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">MeshCentral версия:</span>
                            <span class="info-value">${escapeHtml(node.meshVersion || 'Н/Д')}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Аппаратная информация -->
            <div class="section">
                <h2 class="section-title">💻 Аппаратное обеспечение</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Процессор и память</h3>
                        <div class="info-row">
                            <span class="info-label">Процессор:</span>
                            <span class="info-value">${escapeHtml(cpuInfo)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Оперативная память:</span>
                            <span class="info-value">${ramInfo}</span>
                        </div>
                        ${node.hardware && node.hardware.swap ? `
                        <div class="info-row">
                            <span class="info-label">Swap память:</span>
                            <span class="info-value">${formatBytes(node.hardware.swap)}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${node.hardware && (node.hardware.manufacturer || node.hardware.model || node.hardware.serial) ? `
                    <div class="info-card">
                        <h3>Информация о системе</h3>
                        ${node.hardware.manufacturer ? `
                        <div class="info-row">
                            <span class="info-label">Производитель:</span>
                            <span class="info-value">${escapeHtml(node.hardware.manufacturer)}</span>
                        </div>
                        ` : ''}
                        ${node.hardware.model ? `
                        <div class="info-row">
                            <span class="info-label">Модель:</span>
                            <span class="info-value">${escapeHtml(node.hardware.model)}</span>
                        </div>
                        ` : ''}
                        ${node.hardware.serial ? `
                        <div class="info-row">
                            <span class="info-label">Серийный номер:</span>
                            <span class="info-value">${escapeHtml(node.hardware.serial)}</span>
                        </div>
                        ` : ''}
                        ${node.hardware.uuid ? `
                        <div class="info-row">
                            <span class="info-label">UUID:</span>
                            <span class="info-value">${escapeHtml(node.hardware.uuid)}</span>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Информация о дисках -->
            ${node.diskinfo && node.diskinfo.length > 0 ? `
            <div class="section">
                <h2 class="section-title">💾 Дисковая подсистема</h2>
                <div class="info-card">
                    <table>
                        <thead>
                            <tr><th>Диск/Раздел</th><th>Всего</th><th>Использовано</th><th>Свободно</th><th>Использовано %</th></tr>
                        </thead>
                        <tbody>
                            ${node.diskinfo.map(disk => {
                                const total = formatBytes(disk.total);
                                const used = formatBytes(disk.used);
                                const free = formatBytes(disk.free);
                                const percent = disk.total ? ((disk.used / disk.total) * 100).toFixed(1) : 0;
                                return `<tr>
                                    <td>${escapeHtml(disk.name || disk.mount || disk.volume || 'Н/Д')}</td>
                                    <td>${total}</td>
                                    <td>${used}</td>
                                    <td>${free}</td>
                                    <td>${percent}%</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- Сетевая информация -->
            ${node.netif && node.netif.length > 0 ? `
            <div class="section">
                <h2 class="section-title">🌐 Сетевые интерфейсы</h2>
                <div class="info-card">
                    <table>
                        <thead>
                            <tr><th>Интерфейс</th><th>IP адрес</th><th>MAC адрес</th><th>Статус</th></tr>
                        </thead>
                        <tbody>
                            ${node.netif.map(net => {
                                const ipAddress = net.ip4Address || net.ip4 || net.ip || net.address || 'Н/Д';
                                const macAddress = net.mac || 'Н/Д';
                                const status = net.status || (ipAddress !== 'Н/Д' ? 'Активен' : 'Неактивен');
                                return `<tr>
                                    <td>${escapeHtml(net.name || 'Н/Д')}</td>
                                    <td>${escapeHtml(ipAddress)}</td>
                                    <td>${escapeHtml(macAddress)}</td>
                                    <td>${status}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- Активные пользователи -->
            ${node.users && node.users.length > 0 ? `
            <div class="section">
                <h2 class="section-title">👥 Активные пользователи</h2>
                <div class="info-card">
                    <ul style="list-style: none; padding: 0;">
                        ${node.users.map(user => `<li style="padding: 5px 0; border-bottom: 1px solid #e9ecef;">✓ ${escapeHtml(user.name || user.user || user.username || 'Пользователь')}${user.domain ? ` (${user.domain})` : ''}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
            
            <!-- Время активности -->
            <div class="section">
                <h2 class="section-title">⏱️ Временная информация</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Подключения</h3>
                        <div class="info-row">
                            <span class="info-label">Последнее подключение:</span>
                            <span class="info-value">${formatDate(node.lastConnectTime)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Последнее отключение:</span>
                            <span class="info-value">${formatDate(node.lastDisconnectTime)}</span>
                        </div>
                    </div>
                    <div class="info-card">
                        <h3>Системное время</h3>
                        <div class="info-row">
                            <span class="info-label">Время первого подключения:</span>
                            <span class="info-value">${formatDate(node.regTime)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Общее время онлайн:</span>
                            <span class="info-value">${node.totalOnlineTime ? Math.round(node.totalOnlineTime / 3600) + ' часов' : 'Н/Д'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Теги -->
            ${node.tags && node.tags.length > 0 ? `
            <div class="section">
                <h2 class="section-title">🏷️ Теги</h2>
                <div class="info-card">
                    ${node.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Дополнительная информация -->
            ${node.desc || node.description ? `
            <div class="section">
                <h2 class="section-title">📝 Описание</h2>
                <div class="info-card">
                    <p style="line-height: 1.6;">${escapeHtml(node.desc || node.description)}</p>
                </div>
            </div>
            ` : ''}
            
            <!-- Группы -->
            ${node.meshid ? `
            <div class="section">
                <h2 class="section-title">🔗 Группа</h2>
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">ID группы:</span>
                        <span class="info-value">${escapeHtml(node.meshid)}</span>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Отчет сгенерирован через MeshCentral Plugin Export to PDF | ${now.toLocaleString('ru-RU')}</p>
            <p style="margin-top: 5px;">Система управления удаленными устройствами</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    // Функция для экспорта в PDF через print
    function exportToPDF(deviceData) {
        // Создаем iframe для печати
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        // Записываем HTML в iframe
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(deviceData);
        iframeDoc.close();
        
        // Ждем загрузки и печатаем
        iframe.onload = function() {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Удаляем iframe после печати
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        };
        
        // Если onload не сработал
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                iframe.contentWindow.print();
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 1000);
            }
        }, 500);
    }
    
    // Плагин для MeshCentral
    const plugin = {
        exportpdf: {
            exports: ['exportDeviceInfo', 'showExportDialog'],
            
            // Инициализация плагина в веб-интерфейсе
            onWebUIStartupEnd: function() {
                console.log('[exportpdf] Веб-интерфейс загружен, добавляем кнопку экспорта');
                
                // Добавляем кнопку экспорта на страницу устройства
                setTimeout(() => {
                    this.addExportButton();
                }, 1000);
            },
            
            // Добавление кнопки на страницу details
            addExportButton: function() {
                // Ищем контейнер с кнопками на странице устройства
                const findAndAddButton = () => {
                    // Пробуем разные селекторы для поиска тулбара
                    const toolbars = [
                        '.deviceDetailsToolbar',
                        '.device-toolbar',
                        '.MuiToolbar-root',
                        '[class*="toolbar"]'
                    ];
                    
                    let toolbar = null;
                    for (const selector of toolbars) {
                        toolbar = document.querySelector(selector);
                        if (toolbar) break;
                    }
                    
                    if (toolbar && !document.getElementById('mc-export-pdf-btn')) {
                        const exportBtn = document.createElement('button');
                        exportBtn.id = 'mc-export-pdf-btn';
                        exportBtn.innerHTML = '📄 Экспорт в PDF';
                        exportBtn.style.cssText = `
                            margin-left: 10px;
                            padding: 6px 12px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            transition: transform 0.2s;
                        `;
                        
                        exportBtn.onmouseover = () => {
                            exportBtn.style.transform = 'scale(1.05)';
                        };
                        
                        exportBtn.onmouseout = () => {
                            exportBtn.style.transform = 'scale(1)';
                        };
                        
                        exportBtn.onclick = () => {
                            // Получаем данные текущего устройства
                            this.getCurrentDeviceData();
                        };
                        
                        toolbar.appendChild(exportBtn);
                        console.log('[exportpdf] Кнопка экспорта добавлена');
                    }
                };
                
                // Пытаемся добавить кнопку сразу
                findAndAddButton();
                
                // Наблюдаем за изменениями DOM
                const observer = new MutationObserver(() => {
                    findAndAddButton();
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            },
            
            // Получение данных текущего устройства
            getCurrentDeviceData: function() {
                // Пробуем получить данные из глобального состояния MeshCentral
                let deviceId = null;
                let deviceName = null;
                
                // Способ 1: Из URL
                const urlParams = new URLSearchParams(window.location.search);
                deviceId = urlParams.get('id') || urlParams.get('nodeid');
                
                // Способ 2: Из DOM
                if (!deviceId) {
                    const idElements = document.querySelectorAll('[data-id], [data-nodeid]');
                    for (const el of idElements) {
                        if (el.dataset.id) deviceId = el.dataset.id;
                        if (el.dataset.nodeid) deviceId = el.dataset.nodeid;
                        if (deviceId) break;
                    }
                }
                
                // Получаем имя устройства
                const nameSelectors = [
                    '.deviceDetailsName',
                    '.device-name',
                    'h1',
                    '.MuiTypography-h5'
                ];
                
                for (const selector of nameSelectors) {
                    const nameEl = document.querySelector(selector);
                    if (nameEl && nameEl.textContent) {
                        deviceName = nameEl.textContent.trim();
                        break;
                    }
                }
                
                if (deviceId) {
                    // Запрашиваем данные с сервера
                    this.fetchDeviceData(deviceId, deviceName);
                } else if (window.meshcentral && window.meshcentral.currentDevice) {
                    // Способ 3: Из глобального объекта MeshCentral
                    const device = window.meshcentral.currentDevice;
                    this.generateAndExportPDF(device);
                } else {
                    // Если не можем получить ID, пробуем собрать данные из DOM
                    this.collectDataFromDOM();
                }
            },
            
            // Запрос данных с сервера
            fetchDeviceData: function(deviceId, deviceName) {
                // Показываем индикатор загрузки
                this.showNotification('Сбор информации об устройстве...', 'info');
                
                // Пробуем получить данные через API MeshCentral
                fetch(`/api/device/${deviceId}`)
                    .then(response => {
                        if (response.ok) return response.json();
                        throw new Error('API не доступен');
                    })
                    .then(deviceData => {
                        this.generateAndExportPDF(deviceData);
                    })
                    .catch(error => {
                        console.error('[exportpdf] Ошибка получения данных:', error);
                        this.showNotification('Используем данные из интерфейса...', 'info');
                        this.collectDataFromDOM();
                    });
            },
            
            // Сбор данных из DOM (резервный метод)
            collectDataFromDOM: function() {
                const deviceData = {
                    name: 'Неизвестное устройство',
                    state: 1,
                    type: 0,
                    _id: 'unknown',
                    lastConnectTime: Date.now()
                };
                
                // Собираем информацию из DOM
                const nameEl = document.querySelector('.deviceDetailsName, .device-name, h1');
                if (nameEl) deviceData.name = nameEl.textContent.trim();
                
                // Статус
                const statusEl = document.querySelector('.deviceStatus, .status');
                if (statusEl) {
                    deviceData.state = statusEl.textContent.includes('Онлайн') || statusEl.textContent.includes('Online') ? 1 : 0;
                }
                
                // ОС
                const osEl = document.querySelector('[data-os], .os-info');
                if (osEl) deviceData.os = osEl.textContent;
                
                this.generateAndExportPDF(deviceData);
            },
            
            // Генерация и экспорт PDF
            generateAndExportPDF: function(deviceData) {
                console.log('[exportpdf] Генерация отчета для устройства:', deviceData.name);
                
                // Генерируем HTML отчет
                const htmlReport = generateDeviceReportHTML(deviceData);
                
                // Экспортируем в PDF через print
                exportToPDF(htmlReport);
                
                this.showNotification('Отчет готов к печати!', 'success');
            },
            
            // Экспорт текущего устройства (вызывается из консоли или других плагинов)
            exportDeviceInfo: function(deviceId) {
                if (deviceId) {
                    this.fetchDeviceData(deviceId);
                } else {
                    this.getCurrentDeviceData();
                }
            },
            
            // Показать диалог с информацией перед экспортом
            showExportDialog: function() {
                const confirmExport = confirm('Экспортировать информацию об устройстве в PDF?\n\nБудет создан подробный отчет со всеми характеристиками.');
                if (confirmExport) {
                    this.getCurrentDeviceData();
                }
            },
            
            // Показать уведомление
            showNotification: function(message, type = 'info') {
                const notification = document.createElement('div');
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
                    color: white;
                    border-radius: 8px;
                    z-index: 10000;
                    font-size: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    animation: slideInRight 0.3s ease-out;
                `;
                
                // Добавляем анимацию
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideInRight {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transition = 'opacity 0.3s';
                    setTimeout(() => {
                        if (notification.parentNode) notification.remove();
                        if (style.parentNode) style.remove();
                    }, 300);
                }, 3000);
            }
        }
    };
    
    return plugin;
};
