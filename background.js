// Background script for EverTrack Safari extension

chrome.runtime.onInstalled.addListener(function() {
    console.log('EverTrack extension installed');
    
    // Set default settings if not already set
    chrome.storage.sync.get({
        apiToken: '',
        dailyTarget: 8,
        weeklyTarget: 40,
        monthlyTarget: 160
    }, function(settings) {
        if (!settings.apiToken) {
            // Open settings page on first install
            chrome.runtime.openOptionsPage();
        }
    });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fetchTimeData') {
        fetchTimeDataForContent(request.apiToken)
            .then(data => sendResponse({success: true, data: data}))
            .catch(error => sendResponse({success: false, error: error.message}));
        return true; // Keep the message channel open for async response
    }
});

// Fetch time data for content script (background can make cross-origin requests)
async function fetchTimeDataForContent(apiToken) {
    if (!apiToken) {
        throw new Error('No API token provided');
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.everhour.com/time?from=${today}&to=${today}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-Api-Key': apiToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Background: API fetch error:', error);
        throw error;
    }
}

// Handle extension icon click
chrome.browserAction.onClicked.addListener(function(tab) {
    // This is handled by the popup, but we can add additional logic here if needed
    console.log('Extension icon clicked');
});

// Optional: Add badge text to show quick status
function updateBadge() {
    chrome.storage.sync.get(['apiToken'], function(settings) {
        if (!settings.apiToken) {
            chrome.browserAction.setBadgeText({text: '!'});
            chrome.browserAction.setBadgeBackgroundColor({color: '#FF3B30'});
        } else {
            chrome.browserAction.setBadgeText({text: ''});
        }
    });
}

// Update badge when settings change
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.apiToken) {
        updateBadge();
    }
});

// Initialize badge
updateBadge();