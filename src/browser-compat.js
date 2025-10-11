/**
 * Browser Compatibility Layer
 * Provides cross-browser compatibility for Chrome (MV3), Firefox, and Safari WebExtension APIs
 */

// Create a unified browser API object that works across all browsers
const browserAPI = (() => {
    // Firefox uses 'browser' namespace, Chrome/Safari use 'chrome'
    const api = (typeof browser !== 'undefined') ? browser : chrome;
    
    // Detect if we're in Manifest V3 (Chrome) or V2 (Firefox/Safari)
    const isManifestV3 = !!(api.action);
    
    return {
        // Runtime APIs
        runtime: {
            onInstalled: api.runtime.onInstalled,
            onMessage: api.runtime.onMessage,
            openOptionsPage: api.runtime.openOptionsPage,
            getURL: api.runtime.getURL,
            lastError: api.runtime.lastError
        },
        
        // Storage APIs - handle both callback and promise patterns
        storage: {
            sync: {
                get: (keys, callback) => {
                    if (typeof browser !== 'undefined') {
                        // Firefox uses promises
                        api.storage.sync.get(keys).then(callback);
                    } else if (isManifestV3) {
                        // Chrome MV3 uses promises
                        api.storage.sync.get(keys).then(callback);
                    } else {
                        // Chrome MV2/Safari uses callbacks
                        api.storage.sync.get(keys, callback);
                    }
                },
                set: (items, callback) => {
                    if (typeof browser !== 'undefined') {
                        // Firefox uses promises
                        api.storage.sync.set(items).then(callback || (() => {}));
                    } else if (isManifestV3) {
                        // Chrome MV3 uses promises
                        api.storage.sync.set(items).then(callback || (() => {}));
                    } else {
                        // Chrome MV2/Safari uses callbacks
                        api.storage.sync.set(items, callback);
                    }
                }
            },
            onChanged: api.storage.onChanged
        },
        
        // Browser Action APIs - handle MV3 'action' vs MV2 'browserAction'
        browserAction: {
            onClicked: isManifestV3 ? api.action?.onClicked : api.browserAction?.onClicked,
            setBadgeText: (details) => {
                const actionAPI = isManifestV3 ? api.action : api.browserAction;
                return actionAPI?.setBadgeText(details);
            },
            setBadgeBackgroundColor: (details) => {
                const actionAPI = isManifestV3 ? api.action : api.browserAction;
                return actionAPI?.setBadgeBackgroundColor(details);
            }
        }
    };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = browserAPI;
}
if (typeof window !== 'undefined') {
    window.browserAPI = browserAPI;
}