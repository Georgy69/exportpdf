/**
@description MeshCentral Device PDF Exporter Plugin
@author Georgy69
@license Apache-2.0
@version v1.0.2
*/
"use strict";

module.exports.pdfexport = function (parent) {
    var obj = {};
    obj.parent = parent;

    // ✅ ОБЯЗАТЕЛЬНО: Экспортируем registerPluginTab
    obj.exports = [
        "registerPluginTab",
        "onBuildPluginTab",
        "exportDeviceToPDF"
    ];

    // ✅ РЕГИСТРАЦИЯ ВКЛАДКИ (Вызывается MeshCentral автоматически)
    obj.registerPluginTab = function() {
        return {
            tabTitle: "PDF Export",
            tabId: "pluginPdfExport"
        };
    };

    // Отрисовка содержимого вкладки
    obj.onBuildPluginTab = function(pluginIndex, node, container) {
        if (!container) return;
        container.innerHTML = '';
        
        var card = document.createElement('div');
        card.style.padding = '20px';
        card.style.backgroundColor = '#ffffff';
        card.style.borderRadius = '8px';
        card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        card.style.margin = '15px';
        card.style.maxWidth = '500px';

        var title = document.createElement('h2');
        title.style.marginTop = '0';
        title.style.color = '#1f4e79';
        title.innerText = '📄 Экспорт сведений об устройстве';
        card.appendChild(title);

        var desc = document.createElement('p');
        desc.style.color = '#555';
        desc.innerText = 'Сгенерируйте и скачайте сводный PDF-отчет для устройства (' + (node ? node.name : 'N/A') + ').';
        card.appendChild(desc);

        var btn = document.createElement('button');
        btn.className = 'btn medium blue';
        btn.style.padding = '8px 16px';
        btn.style.fontSize = '14px';
        btn.style.cursor = 'pointer';
        btn.innerText = 'Скачать PDF отчет';
        btn.onclick = function() {
            obj.exportDeviceToPDF(node || (typeof currentNode !== 'undefined' ? currentNode : null));
        };
        card.appendChild(btn);

        container.appendChild(card);
    };

    // Логика генерации PDF
    obj.exportDeviceToPDF = function(deviceObj) {
        var dev = deviceObj || (typeof currentNode !== 'undefined' ? currentNode : null);
        if (!dev) {
            alert("Ошибка: Устройство не выбрано.");
            return;
        }
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = function() { obj.generatePDF(dev); };
            script.onerror = function() { alert("Ошибка загрузки jsPDF"); };
            document.head.appendChild(script);
        } else {
            obj.generatePDF(dev);
        }
    };

    obj.generatePDF = function(dev) {
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
        var startY = 48;
        var lineHeight = 7;
        var details = [
            ["Device Name:", dev.name || "N/A"],
            ["Node ID:", dev._id || "N/A"],
            ["Hostname:", dev.hostname || "N/A"],
            ["OS:", dev.osdesc || "N/A"],
            ["IP Address:", dev.ip || "N/A"],
            ["Status:", (dev.conn & 1) ? "Online" : "Offline"],
            ["Report Generated:", new Date().toLocaleString()]
        ];
        details.forEach(function(item) {
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
// ❌ НИКАКОГО КОДА ПОСЛЕ ЗАКРЫВАЮЩЕЙ СКОБКИ module.exports!
// Удалите всё, что было ниже этой строки в старом файле.
