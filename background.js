// Background script for EverTrack Safari extension

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
                sendResponse({success: true, data: data});
            })
            .catch(error => {
                console.error('Background: API error:', error);
                sendResponse({success: false, error: error.message});
            });
        return true; // Keep the message channel open for async response
    }
});

// Fetch time data for content script (background can make cross-origin requests)
async function fetchTimeDataForContent(apiToken, from, to) {
    if (!apiToken) {
        throw new Error('No API token provided');
    }

    const fromDate = from || new Date().toISOString().split('T')[0];
    const toDate = to || fromDate;
    const url = `https://api.everhour.com/users/me/time?from=${fromDate}&to=${toDate}`;

    console.log('Background: Making API request to:', url);
    console.log('Background: Using date range:', fromDate, 'to', toDate);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiToken,
                'Content-Type': 'application/json'
            }
        });

        console.log('Background: API response status:', response.status);
        console.log('Background: API response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Background: API error response:', errorText);
            throw new Error(`API error: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
        }

        const data = await response.json();
        console.log('Background: Successfully fetched data:', data);
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