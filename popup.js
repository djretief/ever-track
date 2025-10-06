document.addEventListener('DOMContentLoaded', function() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentEl = document.getElementById('content');
    const modeLabelEl = document.getElementById('mode-label');
    const workedHoursEl = document.getElementById('worked-hours');
    const targetHoursEl = document.getElementById('target-hours');
    const progressFillEl = document.getElementById('progress-fill');
    const progressTextEl = document.getElementById('progress-text');
    const statusInfoEl = document.getElementById('status-info');
    const settingsLink = document.getElementById('settings-link');
    
    let timeData = null;
    let settings = null;
    
    // Load settings and data
    loadData();
    
    // Settings link
    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
    
    async function loadData() {
        try {
            // Load settings first
            settings = await loadSettings();
            
            if (!settings.apiToken) {
                showError('Please configure your Everhour API token in settings.');
                return;
            }
            
            // Load time data
            timeData = await fetchTimeData();
            
            if (timeData) {
                showContent();
                updateDisplay();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showError('Failed to load time data. Please check your settings.');
        }
    }
    
    function loadSettings() {
        const defaultSchedule = {
            monday: { enabled: true, start: '09:00', end: '17:00' },
            tuesday: { enabled: true, start: '09:00', end: '17:00' },
            wednesday: { enabled: true, start: '09:00', end: '17:00' },
            thursday: { enabled: true, start: '09:00', end: '17:00' },
            friday: { enabled: true, start: '09:00', end: '17:00' },
            saturday: { enabled: false, start: '09:00', end: '17:00' },
            sunday: { enabled: false, start: '09:00', end: '17:00' }
        };
        
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                apiToken: '',
                trackingMode: 'weekly',
                dailyTarget: 8,
                weeklyTarget: 38,
                monthlyTarget: 160,
                workSchedule: defaultSchedule
            }, resolve);
        });
    }
    
    async function fetchTimeData() {
        const today = new Date();
        let from, to;
        
        // Calculate date range based on tracking mode
        switch (settings.trackingMode) {
            case 'daily':
                from = to = today;
                break;
            case 'weekly':
                from = new Date(today);
                from.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                to = today;
                break;
            case 'monthly':
                from = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
                to = today;
                break;
            default:
                from = new Date(today);
                from.setDate(today.getDate() - today.getDay());
                to = today;
        }
        
        // Format dates for API
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        try {
            const data = await fetchEverhourData(formatDate(from), formatDate(to));
            return calculateTotalHours(data);
        } catch (error) {
            throw new Error('Failed to fetch time data from Everhour API');
        }
    }
    
    async function fetchEverhourData(from, to) {
        const response = await fetch(`https://api.everhour.com/users/me/time?from=${from}&to=${to}`, {
            headers: {
                'X-Api-Key': settings.apiToken,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    }
    
    function calculateTotalHours(timeEntries) {
        if (!Array.isArray(timeEntries)) return 0;
        
        const totalSeconds = timeEntries.reduce((total, entry) => {
            return total + (entry.time || 0);
        }, 0);
        
        return Math.round((totalSeconds / 3600) * 100) / 100; // Convert to hours with 2 decimal places
    }

    // Utility functions for work schedule calculations
    function parseTimeString(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + minutes / 60;
    }

    function calculateWorkHoursForDay(daySchedule) {
        if (!daySchedule.enabled) return 0;
        const startHours = parseTimeString(daySchedule.start);
        const endHours = parseTimeString(daySchedule.end);
        return Math.max(0, endHours - startHours);
    }

    function getElapsedWorkHours(targetDate, workSchedule) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        // If target date is in the future, no elapsed time
        if (target > today) return 0;
        
        // If target date is before today, full work day has elapsed
        if (target < today) {
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()];
            return calculateWorkHoursForDay(workSchedule[dayOfWeek]);
        }
        
        // Target date is today - calculate elapsed work hours
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()];
        const daySchedule = workSchedule[dayOfWeek];
        
        if (!daySchedule.enabled) return 0;
        
        const currentHour = now.getHours() + now.getMinutes() / 60;
        const startHour = parseTimeString(daySchedule.start);
        const endHour = parseTimeString(daySchedule.end);
        
        // Before work hours
        if (currentHour < startHour) return 0;
        
        // After work hours
        if (currentHour >= endHour) return endHour - startHour;
        
        // During work hours
        return currentHour - startHour;
    }

    function calculateProRatedTarget(settings) {
        const now = new Date();
        const { trackingMode, workSchedule } = settings;
        const fullTarget = settings[`${trackingMode}Target`];
        
        let totalWorkHours = 0;
        let elapsedWorkHours = 0;
        
        if (trackingMode === 'daily') {
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
            totalWorkHours = calculateWorkHoursForDay(workSchedule[dayOfWeek]);
            elapsedWorkHours = getElapsedWorkHours(now, workSchedule);
        } else if (trackingMode === 'weekly') {
            // Calculate for the week (Sunday to Saturday)
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][i];
                
                const dayWorkHours = calculateWorkHoursForDay(workSchedule[dayOfWeek]);
                totalWorkHours += dayWorkHours;
                
                if (date <= now) {
                    elapsedWorkHours += getElapsedWorkHours(date, workSchedule);
                }
            }
        } else if (trackingMode === 'monthly') {
            // Calculate for the month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
                const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
                const dayWorkHours = calculateWorkHoursForDay(workSchedule[dayOfWeek]);
                totalWorkHours += dayWorkHours;
                
                if (date <= now) {
                    elapsedWorkHours += getElapsedWorkHours(new Date(date), workSchedule);
                }
            }
        }
        
        // Calculate pro-rated target
        if (totalWorkHours === 0) return { proRatedTarget: 0, progress: 0, totalWorkHours, elapsedWorkHours };
        
        const workProgress = elapsedWorkHours / totalWorkHours;
        const proRatedTarget = fullTarget * workProgress;
        
        return {
            proRatedTarget: Math.round(proRatedTarget * 100) / 100,
            progress: workProgress,
            totalWorkHours: Math.round(totalWorkHours * 100) / 100,
            elapsedWorkHours: Math.round(elapsedWorkHours * 100) / 100,
            fullTarget
        };
    }
    
    function updateDisplay() {
        if (!timeData || !settings) return;

        const worked = timeData;
        const targetData = calculateProRatedTarget(settings);
        const { proRatedTarget, progress, totalWorkHours, elapsedWorkHours, fullTarget } = targetData;
        
        // Calculate how far ahead or behind we are
        const difference = worked - proRatedTarget;
        const percentage = proRatedTarget > 0 ? Math.round((worked / proRatedTarget) * 100) : 0;
        
        // Update mode label with progress information
        const progressPercent = Math.round(progress * 100);
        modeLabelEl.textContent = `${settings.trackingMode} tracking (${progressPercent}% through work period)`;
        
        // Update text - show actual vs pro-rated target
        workedHoursEl.textContent = `${worked}h`;
        targetHoursEl.textContent = `${proRatedTarget}h expected (${fullTarget}h total)`;
        progressTextEl.textContent = `${percentage}%`;
        
        // Update progress bar - centered design
        progressFillEl.classList.remove('under-target', 'over-target');
        
        let color, status, fillWidth;
        
        if (difference <= 0) {
            // Under or at expected target
            progressFillEl.classList.add('under-target');
            const targetPercentage = proRatedTarget > 0 ? (worked / proRatedTarget) * 100 : 0;
            fillWidth = Math.min(50, (targetPercentage / 100) * 50); // Max 50% (left half)
            progressFillEl.style.width = `${fillWidth}%`;
            
            const underPercentage = Math.abs(difference / proRatedTarget) * 100;
            
            if (difference >= 0) {
                // Exactly on target
                color = '#34C759'; // Green - on track
                status = 'On track! 🎯';
            } else if (underPercentage <= 15) {
                // Under target by up to 15% - ORANGE
                color = '#FF9500'; // Orange - slightly behind
                status = `${Math.abs(difference).toFixed(1)}h behind expected progress`;
            } else {
                // Under target by more than 15% - RED
                color = '#FF3B30'; // Red - significantly behind
                status = `${Math.abs(difference).toFixed(1)}h behind expected progress`;
            }
        } else {
            // Ahead of expected target
            progressFillEl.classList.add('over-target');
            const overPercentage = ((difference / proRatedTarget) * 100);
            fillWidth = Math.min(50, (overPercentage / 100) * 50); // Max 50% (right half)
            progressFillEl.style.width = `${fillWidth}%`;
            
            color = '#34C759'; // Green - ahead of target
            status = `${difference.toFixed(1)}h ahead of expected progress! �`;
        }
        
        progressFillEl.style.backgroundColor = color;
        statusInfoEl.innerHTML = `
            <div>${status}</div>
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">
                Work hours elapsed: ${elapsedWorkHours}h / ${totalWorkHours}h
            </div>
        `;
        statusInfoEl.style.color = color;
    }
    
    function showContent() {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        contentEl.style.display = 'block';
    }
    
    function showError(message) {
        loadingEl.style.display = 'none';
        contentEl.style.display = 'none';
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
});