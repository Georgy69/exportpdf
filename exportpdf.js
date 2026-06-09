'use strict';

module.exports = function (parent) {
    const pluginShortName = 'exportpdf';
    console.log(`[${pluginShortName}] Plugin loading...`);

    const plugin = {};

    plugin[pluginShortName] = {
        // 1. Регистрация вкладки
        registerPluginTab: function () {
            console.log(`[${pluginShortName}] Registering tab.`);
            return {
                tabId: pluginShortName,       // Исправлено: было "tab Id"
                tabTitle: ' Export PDF'
            };
        },

        // 2. Событие при выборе устройства
        onDeviceRefreshEnd: function (parentObj, nodeId, deviceNode) {
            // Исправлено: было "parentOb j"
            if (parentObj.tabIsActive(pluginShortName)) {
                this.renderContent(parentObj, deviceNode);
            }
        },

        // 3. Отрисовка содержимого
        renderContent: function (parentObj, deviceNode) {
            // Просто выводим слово ТЕСТ
            const tabHtml = `<div style="padding: 20px; font-size: 20px; font-weight: bold;">ТЕСТ</div>`;
            
            // Вставляем HTML во вкладку
            parentObj.tabContent(pluginShortName, tabHtml);
        }
    };

    console.log(`[${pluginShortName}] Ready.`);
    return plugin;
};
