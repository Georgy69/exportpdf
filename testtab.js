"use strict";

module.exports.testtab = function (parent) {
    var obj = {};
    obj.parent = parent;

    // Экспортируем только то, что нужно для теста
    obj.exports = [
        "onDeviceRefreshEnd",
        "onBuildPluginTab"
    ];

    // РЕГИСТРАЦИЯ ВКЛАДКИ (Способ B как в FileDistribution)
    obj.onDeviceRefreshEnd = function() {
        pluginHandler.registerPluginTab({
            tabTitle: '🧪 Тест',
            tabId: 'pluginTestTab'
        });
    };

    // ОТРИСОВКА СОДЕРЖИМОГО
    obj.onBuildPluginTab = function(pluginIndex, node, container) {
        if (!container) return;
        container.innerHTML = '<div style="padding:30px;font-size:18px;color:green;">✅ Тест успешен! Вкладка создана и работает.</div>';
    };

    return obj;
};
