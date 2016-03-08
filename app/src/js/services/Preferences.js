angular.module('media_manager').service('Preferences', function() {
    var pr = this;
    var default_prefs = {
        ui: {
            workspace: {
                layout: "gallery"
            }
        }
    };
    
    pr.prefs = default_prefs;
    pr.UI_WORKSPACE_LAYOUT = "ui.workspace.layout";
    
    // Returns the value for a given key.
    pr.get = function(key) {
        var val, path, i;
        if (typeof key == "undefined") {
            return pr.prefs;
        }

        if (key.indexOf('.') == -1) {
            val = pr.prefs[key];
        } else {
            for(path = key.split('.'), val = pr.prefs[path[0]], i = 1; i < path.length; i++) {
                if (!val.hasOwnProperty(path[i])) {
                    throw "Error looking up preference. No such key exists: " + key;
                }
                val = val[path[i]];
            }
        }
        return val;
    };
    
    // Sets the value for a given key.
    pr.set = function(key, value) {
        var path, obj, i, k;
        if (typeof key == "undefined") {
            throw "Error setting preference key/value. Key parameter is *required*."
        }

        if (key.indexOf('.') == -1) {
            pr.prefs[key] = value;
        } else {
            path = key.split('.');
            obj = pr.prefs;
            for(i = 0; i < path.length - 1; i++) {
                k = path[i];
                obj = obj[k] || {};
            }
            obj[path[path.length-1]] = value;
        }
    };
    
});
