'use strict';

module.exports = function (parent) {
    console.log('[exportpdf] Plugin loaded successfully');
    
    return {
        exportpdf: {
            onWebUIStartupEnd: function() {
                console.log('[exportpdf] Web UI hook triggered');
                alert('Export PDF Plugin is working!');
            }
        }
    };
};