// EverTrack Content Script - Injects progress bar into Everhour
console.log('EverTrack: Content script loaded');

class EverTrackInjector {
    constructor() {
        this.progressBarId = 'evertrack-progress-bar';
        this.settings = null;
        this.updateInterval = null;
        this.retryAttempts = 0;
        this.maxRetries = 20; // Try for ~20 seconds
        
        this.init();
    }

    async init() {
        console.log('EverTrack: Initializing injector');
        
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    async start() {
        try {
            // Load settings
            this.settings = await this.loadSettings();
            
            if (!this.settings.apiToken) {
                console.log('EverTrack: No API token configured');
                return;
            }

            // Find timer element and inject progress bar
            this.findTimerAndInject();
            
            // Set up periodic updates
            this.startPeriodicUpdates();
            
        } catch (error) {
            console.error('EverTrack: Error starting injector:', error);
        }
    }

    findTimerAndInject() {
        // Look for the time-timer-input-v2 element
        const timerElement = document.querySelector('time-timer-input-v2');
        
        if (timerElement) {
            console.log('EverTrack: Found timer element');
            this.injectProgressBar(timerElement);
            return true;
        }

        // If not found and we haven't exceeded retries, try again
        if (this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            console.log(`EverTrack: Timer element not found, retrying... (${this.retryAttempts}/${this.maxRetries})`);
            setTimeout(() => this.findTimerAndInject(), 1000);
            return false;
        }

        console.log('EverTrack: Timer element not found after maximum retries');
        return false;
    }

    injectProgressBar(timerElement) {
        // Check if already injected
        if (document.getElementById(this.progressBarId)) {
            console.log('EverTrack: Progress bar already exists');
            this.updateProgressBar();
            return;
        }

        console.log('EverTrack: Injecting progress bar');

        // Create the progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.id = this.progressBarId;
        progressContainer.className = 'evertrack-progress-container';
        
        progressContainer.innerHTML = `
            <div class="evertrack-progress-header">
                <span class="evertrack-logo">🎯 EverTrack</span>
                <span class="evertrack-status" id="evertrack-status">Loading...</span>
            </div>
            <div class="evertrack-progress-bar">
                <div class="evertrack-progress-fill" id="evertrack-progress-fill"></div>
                <div class="evertrack-progress-text" id="evertrack-progress-text">--</div>
            </div>
            <div class="evertrack-details" id="evertrack-details">
                Calculating progress...
            </div>
        `;

        // Insert before the timer element
        timerElement.parentNode.insertBefore(progressContainer, timerElement);

        // Load and update the progress bar
        this.updateProgressBar();
    }

    async updateProgressBar() {
        try {
            console.log('EverTrack: Updating progress bar');
            
            const timeData = await this.fetchTimeData();
            if (!timeData) {
                this.showError('Failed to load time data');
                return;
            }

            this.displayProgress(timeData);
            
        } catch (error) {
            console.error('EverTrack: Error updating progress bar:', error);
            this.showError('Error loading data');
        }
    }

    displayProgress(timeData) {
        const statusEl = document.getElementById('evertrack-status');
        const fillEl = document.getElementById('evertrack-progress-fill');
        const textEl = document.getElementById('evertrack-progress-text');
        const detailsEl = document.getElementById('evertrack-details');

        if (!statusEl || !fillEl || !textEl || !detailsEl) {
            console.log('EverTrack: Progress bar elements not found');
            return;
        }

        const { worked, proRatedTarget, difference } = this.calculateProgress(timeData);
        
        // Calculate percentage and color
        let color, status, percentage;
        
        if (difference > 0) {
            // Ahead of target
            color = '#34C759'; // Green
            percentage = Math.min(100, (worked / proRatedTarget) * 100);
            status = `${difference.toFixed(1)}h ahead! 🚀`;
            statusEl.className = 'evertrack-status ahead';
        } else if (difference >= 0) {
            // Exactly on target
            color = '#34C759'; // Green
            percentage = 100;
            status = 'On track! 🎯';
            statusEl.className = 'evertrack-status on-track';
        } else {
            // Behind target
            const underPercentage = Math.abs(difference / proRatedTarget) * 100;
            percentage = Math.max(0, (worked / proRatedTarget) * 100);
            
            if (underPercentage <= 15) {
                color = '#FF9500'; // Orange
                status = `${Math.abs(difference).toFixed(1)}h behind`;
                statusEl.className = 'evertrack-status behind';
            } else {
                color = '#FF3B30'; // Red
                status = `${Math.abs(difference).toFixed(1)}h behind`;
                statusEl.className = 'evertrack-status significantly-behind';
            }
        }

        // Update the display
        statusEl.textContent = status;
        statusEl.style.color = '';  // Reset inline color, use class-based styling
        
        fillEl.style.width = `${Math.max(0, percentage)}%`;
        fillEl.style.backgroundColor = color;
        fillEl.style.opacity = percentage > 0 ? '1' : '0';
        
        textEl.textContent = `${worked.toFixed(1)}h / ${proRatedTarget.toFixed(1)}h`;
        
        // Update details
        const targetHours = this.getTodayTargetHours();
        detailsEl.innerHTML = `
            <small>Target: ${targetHours}h | Progress: ${Math.round(percentage)}%</small>
        `;
    }

    calculateProgress(timeData) {
        // Get today's target hours
        const targetHours = this.getTodayTargetHours();
        
        // Calculate pro-rated target based on work schedule
        const proRatedTarget = this.calculateProRatedTarget(targetHours);
        
        // Get worked hours from API data
        const worked = timeData.reduce((total, entry) => total + (entry.time || 0), 0) / 3600;
        
        // Calculate difference
        const difference = worked - proRatedTarget;
        
        return { worked, proRatedTarget, difference };
    }

    getTodayTargetHours() {
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[today];
        
        return this.settings.workSchedule?.[dayName] || this.settings.targetHours || 8;
    }

    calculateProRatedTarget(targetHours) {
        const now = new Date();
        const workSchedule = this.settings.workSchedule;
        
        if (!workSchedule) {
            // Fallback to simple calculation
            const hour = now.getHours();
            const minute = now.getMinutes();
            const currentTime = hour + minute / 60;
            
            const workStart = 9; // 9 AM
            const workEnd = 17; // 5 PM
            const totalWorkHours = workEnd - workStart;
            
            if (currentTime <= workStart) return 0;
            if (currentTime >= workEnd) return targetHours;
            
            const elapsedWorkTime = currentTime - workStart;
            return (elapsedWorkTime / totalWorkHours) * targetHours;
        }

        // Use work schedule calculation (similar to popup.js)
        const startTime = this.parseTime(workSchedule.startTime || '09:00');
        const endTime = this.parseTime(workSchedule.endTime || '17:00');
        const totalWorkMinutes = this.getWorkMinutesBetween(startTime, endTime);
        const elapsedWorkMinutes = this.getElapsedWorkMinutes(startTime, endTime);
        
        if (elapsedWorkMinutes <= 0) return 0;
        if (elapsedWorkMinutes >= totalWorkMinutes) return targetHours;
        
        return (elapsedWorkMinutes / totalWorkMinutes) * targetHours;
    }

    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    getWorkMinutesBetween(startMinutes, endMinutes) {
        if (endMinutes <= startMinutes) {
            return (24 * 60 - startMinutes) + endMinutes;
        }
        return endMinutes - startMinutes;
    }

    getElapsedWorkMinutes(startMinutes, endMinutes) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        if (currentMinutes < startMinutes) return 0;
        if (currentMinutes >= endMinutes) return this.getWorkMinutesBetween(startMinutes, endMinutes);
        
        return currentMinutes - startMinutes;
    }

    showError(message) {
        const statusEl = document.getElementById('evertrack-status');
        const fillEl = document.getElementById('evertrack-progress-fill');
        const textEl = document.getElementById('evertrack-progress-text');
        const detailsEl = document.getElementById('evertrack-details');
        
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'evertrack-status error';
        }
        
        if (fillEl) {
            fillEl.style.width = '0%';
            fillEl.style.opacity = '0';
        }
        
        if (textEl) {
            textEl.textContent = 'Error loading data';
        }
        
        if (detailsEl) {
            detailsEl.innerHTML = '<small>Check your API token in extension settings</small>';
        }
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                'apiToken',
                'targetHours',
                'workSchedule'
            ], (result) => {
                resolve({
                    apiToken: result.apiToken || '',
                    targetHours: result.targetHours || 8,
                    workSchedule: result.workSchedule || null
                });
            });
        });
    }

    async fetchTimeData() {
        if (!this.settings?.apiToken) return null;

        try {
            // Use background script to make API call (avoids CORS issues)
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'fetchTimeData',
                    apiToken: this.settings.apiToken
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.error));
                    }
                });
            });

            return response;
        } catch (error) {
            console.error('EverTrack: API fetch error:', error);
            throw error;
        }
    }

    startPeriodicUpdates() {
        // Update every 2 minutes
        this.updateInterval = setInterval(() => {
            this.updateProgressBar();
        }, 2 * 60 * 1000);

        console.log('EverTrack: Started periodic updates');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const progressBar = document.getElementById(this.progressBarId);
        if (progressBar) {
            progressBar.remove();
        }
    }
}

// Initialize when script loads
let everTrackInjector = null;

// Handle navigation in single-page app
function initEverTrack() {
    if (everTrackInjector) {
        everTrackInjector.destroy();
    }
    everTrackInjector = new EverTrackInjector();
}

// Initialize immediately
initEverTrack();

// Re-initialize on navigation (for SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        console.log('EverTrack: Navigation detected, reinitializing');
        setTimeout(() => initEverTrack(), 1000);
    }
}).observe(document, { subtree: true, childList: true });