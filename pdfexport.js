"use strict";
module.exports.pdfexport = function (parent) {
    var obj = {};
    obj.parent = parent;

    // Экспортируем только хук обновления устройства
    obj.exports = ["onDeviceRefreshEnd"];

    obj.onDeviceRefreshEnd = function () {
        if (typeof pluginHandler === 'undefined' || !pluginHandler.registerPluginTab) return;

        // Регистрируем вкладку через глобальный pluginHandler
        pluginHandler.registerPluginTab({
            tabTitle: '📄 PDF Export',
            tabId: 'pdfexport'
        });

        // Функция отрисовки контента
        var renderContent = function () {
            var container = document.getElementById('pdfexport');
            if (!container || container.offsetParent === null) return;

            // Получаем текущее устройство из глобальной переменной MeshCentral
            var dev = (typeof currentNode !== 'undefined') ? currentNode : null;
            var deviceName = dev ? dev.name : 'N/A';

            // Рендерим интерфейс только если контейнер пустой (чтобы не пересоздавать при каждом клике)
            if (container.innerHTML.trim() !== '') return;

            container.innerHTML = '';
            var card = document.createElement('div');
            card.style.cssText = 'padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);margin:15px;max-width:500px;';

            var title = document.createElement('h2');
            title.style.cssText = 'margin-top:0;color:#1f4e79;';
            title.innerText = '📄 Экспорт сведений об устройстве';
            card.appendChild(title);

            var desc = document.createElement('p');
            desc.style.color = '#555';
            desc.innerText = 'Сгенерируйте и скачайте сводный PDF-отчет для устройства (' + deviceName + ').';
            card.appendChild(desc);

            var btn = document.createElement('button');
            btn.className = 'btn medium blue';
            btn.style.cssText = 'padding:8px 16px;font-size:14px;cursor:pointer;';
            btn.innerText = 'Скачать PDF отчет';
            btn.onclick = function () { obj.exportDeviceToPDF(dev); };
            card.appendChild(btn);

            container.appendChild(card);
        };

        // Отрисовываем сразу и при клике на вкладку
        renderContent();
        var tabBtn = document.querySelector('[data-tabid="pdfexport"]') ||
                     document.querySelector('button[onclick*="pdfexport"]');
        if (tabBtn && !tabBtn._pdfExportBound) {
            tabBtn.addEventListener('click', function () { setTimeout(renderContent, 50); });
            tabBtn._pdfExportBound = true;
        }
    };

    // Логика генерации PDF (без изменений)
    obj.exportDeviceToPDF = function (deviceObj) {
        var dev = deviceObj || ((typeof currentNode !== 'undefined') ? currentNode : null);
        if (!dev) { alert("Ошибка: Устройство не выбрано."); return; }

        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = function () { obj.generatePDF(dev); };
            document.head.appendChild(script);
        } else {
            obj.generatePDF(dev);
        }
    };

    obj.generatePDF = function (dev) {
        var jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        var doc = new jsPDF();
        doc.setFillColor(31, 78, 121);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("MeshCentral - Device Report", 14, 16);
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("System Information", 14, 38);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 40, 196, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        var startY = 48, lineHeight = 7;
        var details = [
            ["Device Name:", dev.name || "N/A"],
            ["Node ID:", dev._id || "N/A"],
            ["Hostname:", dev.hostname || "N/A"],
            ["OS:", dev.osdesc || "N/A"],
            ["IP Address:", dev.ip || "N/A"],
            ["Status:", (dev.conn & 1) ? "Online" : "Offline"],
            ["Report Generated:", new Date().toLocaleString()]
        ];
        details.forEach(function (item) {
            doc.setFont("helvetica", "bold");
            doc.text(item[0], 14, startY);
            doc.setFont("helvetica", "normal");
            doc.text(String(item[1]), 65, startY);
            startY += lineHeight;
        });
        var fileName = (dev.name || "device").replace(/[^a-z0-9]/gi, '_').toLowerCase() + "_report.pdf";
        doc.save(fileName);
    };

    return obj;
};
