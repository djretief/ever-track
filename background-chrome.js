/**
 * Browser Compatibility Layer for Chrome MV3
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

// Background script for EverTrack Chrome extension (Manifest V3)

browserAPI.runtime.onInstalled.addListener(function() {
    console.log('EverTrack extension installed');
    
    // Set default settings if not already set
    browserAPI.storage.sync.get({
        apiToken: '',
        dailyTarget: 8,
        weeklyTarget: 40,
        monthlyTarget: 160
    }, function(settings) {
        if (!settings.apiToken) {
            // Open settings page on first install
            browserAPI.runtime.openOptionsPage();
        }
    });
});

// Handle messages from content script
browserAPI.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background: Received message:', request);
    
    if (request.action === 'fetchTimeData') {
        console.log('Background: Fetching time data with token:', request.apiToken ? 'Present' : 'Missing');
        console.log('Background: Date range:', request.from, 'to', request.to);
        
        fetchTimeDataForContent(request.apiToken, request.from, request.to)
            .then(data => {
                console.log('Background: API success, data length:', data?.length || 0);
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error('Background: API error:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        // Return true to indicate we'll send response asynchronously
        return true;
    }
    
    // Handle other message types
    sendResponse({ success: false, error: 'Unknown action' });
});

// Fetch time data for content script (handles CORS)
async function fetchTimeDataForContent(apiToken, from, to) {
    if (!apiToken) {
        throw new Error('No API token provided');
    }
    
    const url = `https://api.everhour.com/users/me/time?from=${from}&to=${to}`;
    
    try {
        console.log('Background: Making API request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiToken,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Background: API response received, entries:', data?.length || 0);
        
        return data;
    } catch (error) {
        console.error('Background: Fetch error:', error);
        throw error;
    }
}

// Handle extension icon click
browserAPI.browserAction.onClicked.addListener(function(tab) {
    // This is handled by the popup, but we can add additional logic here if needed
    console.log('Extension icon clicked');
});

// Optional: Add badge text to show quick status
function updateBadge() {
    browserAPI.storage.sync.get(['apiToken'], function(settings) {
        if (!settings.apiToken) {
            browserAPI.browserAction.setBadgeText({text: '!'});
            browserAPI.browserAction.setBadgeBackgroundColor({color: '#FF3B30'});
        } else {
            browserAPI.browserAction.setBadgeText({text: ''});
        }
    });
}

// Update badge when settings change
browserAPI.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.apiToken) {
        updateBadge();
    }
});

// Initialize badge
updateBadge();