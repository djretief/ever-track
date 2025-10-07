/**
 * Browser Compatibility Layer
 * Provides cross-browser compatibility for Chrome and Firefox WebExtension APIs
 */

// Create a unified browser API object that works in both Chrome and Firefox
const browserAPI = (() => {
    // Firefox uses 'browser' namespace, Chrome uses 'chrome'
    const api = (typeof browser !== 'undefined') ? browser : chrome;
    
    return {
        // Runtime APIs
        runtime: {
            onInstalled: api.runtime.onInstalled,
            onMessage: api.runtime.onMessage,
            openOptionsPage: api.runtime.openOptionsPage,
            getURL: api.runtime.getURL,
            lastError: api.runtime.lastError
        },
        
        // Storage APIs
        storage: {
            sync: {
                get: (keys, callback) => {
                    if (typeof browser !== 'undefined') {
                        // Firefox uses promises
                        api.storage.sync.get(keys).then(callback);
                    } else {
                        // Chrome uses callbacks
                        api.storage.sync.get(keys, callback);
                    }
                },
                set: (items, callback) => {
                    if (typeof browser !== 'undefined') {
                        // Firefox uses promises
                        api.storage.sync.set(items).then(callback || (() => {}));
                    } else {
                        // Chrome uses callbacks
                        api.storage.sync.set(items, callback);
                    }
                }
            },
            onChanged: api.storage.onChanged
        },
        
        // Browser Action APIs
        browserAction: {
            onClicked: api.browserAction.onClicked,
            setBadgeText: (details) => {
                if (typeof browser !== 'undefined') {
                    return api.browserAction.setBadgeText(details);
                } else {
                    return api.browserAction.setBadgeText(details);
                }
            },
            setBadgeBackgroundColor: (details) => {
                if (typeof browser !== 'undefined') {
                    return api.browserAction.setBadgeBackgroundColor(details);
                } else {
                    return api.browserAction.setBadgeBackgroundColor(details);
                }
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