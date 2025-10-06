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