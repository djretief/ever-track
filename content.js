// EverTrack Content Script - Injects progress bar into Everhour
console.log('EverTrack: Content script loaded');
console.log('EverTrack: Utils available:', typeof EverTrackUtils !== 'undefined');

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
            console.log('EverTrack: Starting injector...');
            
            // Check if utils are available
            if (typeof EverTrackUtils === 'undefined') {
                console.error('EverTrack: Utils not loaded!');
                return;
            }
            
            // Load settings using shared utility
            this.settings = await EverTrackUtils.loadSettings();
            console.log('EverTrack: Settings loaded:', {
                hasApiToken: !!this.settings.apiToken,
                targetHours: this.settings.targetHours,
                hasWorkSchedule: !!this.settings.workSchedule
            });
            
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
            
            // Use shared utility to fetch time data with tracking mode
            const timeData = await EverTrackUtils.fetchTimeData(this.settings.apiToken, this.settings.trackingMode);
            if (!timeData) {
                this.showError('No time data available');
                return;
            }

            this.displayProgress(timeData);
            
        } catch (error) {
            console.error('EverTrack: Error updating progress bar:', error);
            this.showError(`Error: ${error.message}`);
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

        // Use shared utility to calculate progress (matches popup exactly)
        const { worked, proRatedTarget, difference, fullTarget, progress, totalWorkHours, elapsedWorkHours } = 
            EverTrackUtils.calculateProgress(timeData, this.settings);
        
        console.log('EverTrack Content: Progress calculation result:', {
            worked, proRatedTarget, difference, fullTarget, progress
        });
        
        // Calculate color, status, and fill width (matches popup logic exactly)
        let color, status, fillWidth;
        
        // Clear previous classes
        fillEl.classList.remove('under-target', 'over-target');
        
        if (difference <= 0) {
            // Under or at expected target
            fillEl.classList.add('under-target');
            const targetPercentage = proRatedTarget > 0 ? (worked / proRatedTarget) * 100 : 0;
            fillWidth = Math.min(50, (targetPercentage / 100) * 50); // Max 50% (left half)
            
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
            fillEl.classList.add('over-target');
            const overPercentage = ((difference / proRatedTarget) * 100);
            fillWidth = Math.min(50, (overPercentage / 100) * 50); // Max 50% (right half)
            
            color = '#34C759'; // Green - ahead of target
            status = `${difference.toFixed(1)}h ahead of expected progress! 🚀`;
        }

        // Update the display
        statusEl.textContent = status;
        statusEl.className = 'evertrack-status';
        
        fillEl.style.width = `${fillWidth}%`;
        fillEl.style.backgroundColor = color;
        fillEl.style.opacity = '1';
        
        // Display format matches popup: "worked hours / total target (progress%)"
        const progressPercent = Math.round((progress || 0) * 100);
        textEl.textContent = `${worked.toFixed(1)}h / ${fullTarget}h (${progressPercent}% through work period)`;
        
        // Update details to show pro-rated expected hours (like popup)
        detailsEl.innerHTML = `
            <small>${proRatedTarget.toFixed(1)}h expected | ${elapsedWorkHours.toFixed(1)}h / ${totalWorkHours.toFixed(1)}h work time</small>
        `;
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