/**
 * @description MeshCentral Device Details to PDF Exporter
 * @license Apache-2.0
 * @version v1.0.1
 */
"use strict";

module.exports.devicepdf = function (parent) {
    var obj = {};
    obj.parent = parent;

    obj.exports = [
        "onDeviceToolsClick",
        "renderDeviceInfoButton"
    ];

    // Добавляем кнопку на вкладку деталей устройства
    obj.renderDeviceInfoButton = function () {
        // Проверяем, что мы на странице устройства и кнопка еще не добавлена
        if (!currentNode || document.getElementById('btnExportPdf')) return;
        
        const btnContainer = Q('d2DeviceToolsButtons') || Q('d2headerButtons');
        if (btnContainer) {
            const btn = document.createElement('button');
            btn.id = 'btnExportPdf';
            btn.type = 'button';
            btn.className = 'btn btn-primary btn-sm';
            btn.style.marginLeft = '5px';
            btn.innerHTML = '📄 Сохранить в PDF';
            btn.onclick = obj.onDeviceToolsClick;
            btnContainer.appendChild(btn);
        }
    };

    obj.onDeviceToolsClick = function () {
        if (!currentNode) { alert("Устройство не выбрано"); return; }

        // Динамическая загрузка jsPDF если она отсутствует
        if (typeof window.jspdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => generateDetailsPDF();
            script.onerror = () => alert("Ошибка загрузки библиотеки jsPDF");
            document.head.appendChild(script);
        } else {
            generateDetailsPDF();
        }
    };

    function generateDetailsPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const n = currentNode; // Сокращение для доступа к данным
        
        // Вспомогательная функция для безопасного чтения данных
        const get = (path, def = 'N/A') => {
            try {
                const val = path.split('.').reduce((o, i) => o[i], n);
                return (val !== undefined && val !== null && val !== '') ? val : def;
            } catch(e) { return def; }
        };

        // Заголовок
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(`Отчет: ${n.name || 'Unknown Device'}`, 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Сгенерировано: ${new Date().toLocaleString('ru-RU')}`, 14, 30);
        doc.setDrawColor(200);
        doc.line(14, 34, 196, 34);

        let y = 42;
        const section = (title) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.setFontSize(13);
            doc.setTextColor(0, 102, 204);
            doc.text(title, 14, y);
            y += 7;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(30);
        };

        const row = (label, value) => {
            if (value === 'N/A' || value === undefined) return;
            if (y > 280) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.text(`${label}:`, 14, y);
            doc.setFont(undefined, 'normal');
            // Перенос длинных строк
            const lines = doc.splitTextToSize(String(value), 120);
            doc.text(lines, 60, y);
            y += (lines.length * 5) + 2;
        };

        // === ОСНОВНЫЕ ДАННЫЕ (Из вашего примера) ===
        section("Операционная система");
        row("Имя", n.name);
        row("Версия", get('os.desc') || get('os.name'));
        row("Архитектура", get('os.arch') ? `${get('os.arch')}-битный` : 'N/A');
        row("Last Boot Up Time", get('os.bootTime') ? new Date(get('os.bootTime')).toLocaleString('ru-RU') : 'N/A');
        row("Рабочая группа", get('os.domain') || get('os.workgroup'));

        section("Mesh Agent");
        row("Тип агента", get('agent.desc') || get('agent.ver'));
        row("Последнее подключение", n.conn ? "Подключено сейчас" : "Оффлайн");
        row("IP адрес агента", get('addr'));
        row("Последнее обновление", n.lastSeen ? new Date(n.lastSeen).toLocaleString('ru-RU') : 'N/A');

        section("Сеть");
        if (n.net && Array.isArray(n.net)) {
            n.net.forEach((iface, idx) => {
                row(`Интерфейс ${idx+1}`, iface.desc || iface.name);
                row("MAC", iface.mac);
                row("IPv4", iface.ipv4 ? `${iface.ipv4} / ${iface.mask}` : 'N/A');
                row("Gateway", iface.gateway);
                row("DNS", iface.dns);
                y += 3;
            });
        } else {
            row("MAC", get('net.mac'));
            row("IP", get('net.ipv4'));
        }

        section("Аппаратное обеспечение");
        row("Производитель", get('sys.mfg') || get('bios.mfg'));
        row("Модель", get('sys.model') || get('bios.model'));
        row("Серийный номер", get('sys.serial') || get('bios.serial'));
        row("BIOS Версия", get('bios.ver'));
        row("CPU", get('cpu.name') || get('cpu.speed'));
        row("Ядра CPU", get('cpu.cores'));
        row("ОЗУ", get('mem.total') ? `${Math.round(get('mem.total') / 1024)} MB` : 'N/A');

        section("Хранилище и Тома");
        if (n.storage && Array.isArray(n.storage)) {
            n.storage.forEach(disk => {
                row("Диск", disk.name || disk.desc);
                row("Объем", disk.size ? `${Math.round(disk.size / 1024 / 1024)} GB` : 'N/A');
                row("Статус", disk.status);
                y += 2;
            });
        }
        
        if (n.volumes && Array.isArray(n.volumes)) {
            n.volumes.forEach(vol => {
                row(`Том ${vol.label || vol.name}`, 
                    `${vol.fs || ''} | Объем: ${vol.size ? (vol.size/1024/1024/1024).toFixed(2)+'GB' : '?'} | Свободно: ${vol.free ? (vol.free/1024/1024/1024).toFixed(2)+'GB' : '?'}`
                );
            });
        }

        // Сохранение файла
        doc.save(`${n.name}_Details_${new Date().toISOString().slice(0,10)}.pdf`);
    }

    return obj;
};
