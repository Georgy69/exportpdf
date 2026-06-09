module.exports = function (parent) {
    var obj = {};
    
    obj.onWebUIStartupEnd = function() {
        // Register your tab
        parent.registerPluginTab({
            tabId: "exportpdf_test",
            tabTitle: "Тест"
        });
        
        // Add content to the tab
        var tabDiv = parent.getElementById("exportpdf_test");
        if (tabDiv) {
            tabDiv.innerHTML = `
                <div style="padding: 20px;">
                    <h2>Тест</h2>
                    <p>This text appears on the plugin tab</p>
                </div>
            `;
        }
    };
    
    return obj;
};