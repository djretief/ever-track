document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('settings-form');
    const apiTokenInput = document.getElementById('api-token');
    const trackingModeSelect = document.getElementById('tracking-mode');
    const dailyTargetInput = document.getElementById('daily-target');
    const weeklyTargetInput = document.getElementById('weekly-target');
    const monthlyTargetInput = document.getElementById('monthly-target');
    const testBtn = document.getElementById('test-btn');
    const statusEl = document.getElementById('status');
    
    // Work schedule elements
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const scheduleElements = {};
    
    // Initialize schedule elements
    days.forEach(day => {
        scheduleElements[day] = {
            enabled: document.getElementById(`${day}-enabled`),
            start: document.getElementById(`${day}-start`),
            end: document.getElementById(`${day}-end`)
        };
        
        // Add event listener to enable/disable time inputs
        scheduleElements[day].enabled.addEventListener('change', function() {
            const isEnabled = this.checked;
            scheduleElements[day].start.disabled = !isEnabled;
            scheduleElements[day].end.disabled = !isEnabled;
        });
    });
    
    // Load saved settings
    loadSettings();
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    // Test API connection
    testBtn.addEventListener('click', function() {
        testApiConnection();
    });
    
    function loadSettings() {
        const defaultSchedule = {
            monday: { enabled: true, start: '09:00', end: '17:00' },
            tuesday: { enabled: true, start: '09:00', end: '17:00' },
            wednesday: { enabled: true, start: '08:00', end: '17:00' },
            thursday: { enabled: true, start: '07:00', end: '15:00' },
            friday: { enabled: true, start: '10:00', end: '14:00' },
            saturday: { enabled: false, start: '09:00', end: '17:00' },
            sunday: { enabled: false, start: '09:00', end: '17:00' }
        };
        
        chrome.storage.sync.get({
            apiToken: '',
            trackingMode: 'weekly',
            dailyTarget: 8,
            weeklyTarget: 38,
            monthlyTarget: 160,
            workSchedule: defaultSchedule
        }, function(settings) {
            apiTokenInput.value = settings.apiToken;
            trackingModeSelect.value = settings.trackingMode;
            dailyTargetInput.value = settings.dailyTarget;
            weeklyTargetInput.value = settings.weeklyTarget;
            monthlyTargetInput.value = settings.monthlyTarget;
            
            // Load work schedule
            days.forEach(day => {
                const daySchedule = settings.workSchedule[day] || defaultSchedule[day];
                scheduleElements[day].enabled.checked = daySchedule.enabled;
                scheduleElements[day].start.value = daySchedule.start;
                scheduleElements[day].end.value = daySchedule.end;
                scheduleElements[day].start.disabled = !daySchedule.enabled;
                scheduleElements[day].end.disabled = !daySchedule.enabled;
            });
        });
    }
    
    function saveSettings() {
        // Collect work schedule data
        const workSchedule = {};
        days.forEach(day => {
            workSchedule[day] = {
                enabled: scheduleElements[day].enabled.checked,
                start: scheduleElements[day].start.value,
                end: scheduleElements[day].end.value
            };
        });
        
        const settings = {
            apiToken: apiTokenInput.value.trim(),
            trackingMode: trackingModeSelect.value,
            dailyTarget: parseFloat(dailyTargetInput.value),
            weeklyTarget: parseFloat(weeklyTargetInput.value),
            monthlyTarget: parseFloat(monthlyTargetInput.value),
            workSchedule: workSchedule
        };
        
        // Validate inputs
        if (!settings.apiToken) {
            showStatus('Please enter your Everhour API token.', 'error');
            return;
        }
        
        if (settings.dailyTarget <= 0 || settings.weeklyTarget <= 0 || settings.monthlyTarget <= 0) {
            showStatus('All target hours must be greater than 0.', 'error');
            return;
        }
        
        // Validate work schedule
        let hasWorkDays = false;
        for (const day of days) {
            if (workSchedule[day].enabled) {
                hasWorkDays = true;
                const start = workSchedule[day].start;
                const end = workSchedule[day].end;
                
                if (start >= end) {
                    showStatus(`Invalid work hours for ${day}: end time must be after start time.`, 'error');
                    return;
                }
            }
        }
        
        if (!hasWorkDays) {
            showStatus('Please enable at least one work day.', 'error');
            return;
        }
        
        // Save to storage
        chrome.storage.sync.set(settings, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus('Settings saved successfully!', 'success');
                
                // Test the API connection after saving
                setTimeout(() => {
                    testApiConnection();
                }, 1000);
            }
        });
    }
    
    async function testApiConnection() {
        const apiToken = apiTokenInput.value.trim();
        
        if (!apiToken) {
            showStatus('Please enter your API token first.', 'error');
            return;
        }
        
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';
        
        try {
            // Test API connection by fetching user info
            const response = await fetch('https://api.everhour.com/users/me', {
                headers: {
                    'X-Api-Key': apiToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                showStatus(`✅ API connection successful! Connected as: ${userData.name || userData.email}`, 'success');
            } else {
                throw new Error(`API request failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('API test failed:', error);
            showStatus('❌ API connection failed. Please check your token.', 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test API Connection';
        }
    }
    
    function showStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';
        
        // Hide status after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }
});