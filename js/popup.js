/**
 * EverTrack Popup Script
 * Refactored to use modular architecture
 */

class EverTrackPopup {
    constructor() {
        this.elements = {};
        this.settings = null;
        this.timeData = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize popup
     */
    async init() {
        console.log('EverTrack Popup: Initializing...');
        
        this.bindElements();
        this.bindEvents();
        await this.loadData();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            content: document.getElementById('content'),
            modeLabel: document.getElementById('mode-label'),
            workedHours: document.getElementById('worked-hours'),
            targetHours: document.getElementById('target-hours'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            statusInfo: document.getElementById('status-info'),
            settingsLink: document.getElementById('settings-link')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Settings link
        if (this.elements.settingsLink) {
            this.elements.settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettings();
            });
        }

        // Listen for settings changes
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync') {
                console.log('EverTrack Popup: Settings changed, reloading data...');
                this.loadData();
            }
        });
    }

    /**
     * Load settings and time data
     */
    async loadData() {
        try {
            console.log('EverTrack Popup: Loading data...');
            
            // Show loading state
            EverTrackDOM.showLoading(this.elements.loading, this.elements.content);
            EverTrackDOM.hide(this.elements.error);

            // Load settings
            this.settings = await EverTrackSettings.load();
            console.log('EverTrack Popup: Settings loaded:', this.settings);

            // Validate settings
            const validationErrors = EverTrackSettings.validate(this.settings);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors[0]);
            }

            // Fetch time data
            console.log('EverTrack Popup: Fetching time data...');
            this.timeData = await EverTrackAPI.fetchTimeData(
                this.settings.apiToken,
                this.settings.trackingMode
            );
            console.log('EverTrack Popup: Time data received:', this.timeData);

            // Show content and update display
            EverTrackDOM.showContent(
                this.elements.content,
                this.elements.loading,
                this.elements.error
            );
            
            this.updateDisplay();

        } catch (error) {
            console.error('EverTrack Popup: Error loading data:', error);
            this.showError(error.message);
        }
    }

    /**
     * Update the popup display
     */
    updateDisplay() {
        if (!this.settings || this.timeData === null) {
            console.warn('EverTrack Popup: Cannot update display - missing data');
            return;
        }

        // Get target hours for current mode
        const targetHours = EverTrackSettings.getTargetHours(this.settings);
        
        // Calculate progress
        const progress = EverTrackTime.calculateProgress(this.timeData, targetHours, this.settings.trackingMode, this.settings.workSchedule);
        
        console.log('EverTrack Popup: Progress calculation:', progress);

        // Update DOM elements
        const displayElements = {
            ...this.elements,
            trackingMode: this.settings.trackingMode
        };
        
        EverTrackDOM.updateProgressBar(displayElements, progress);

        // Update mode label with period description
        const periodDescription = EverTrackTime.getPeriodDescription(this.settings.trackingMode);
        EverTrackDOM.setText(this.elements.modeLabel, `${this.settings.trackingMode} (${periodDescription})`);
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        EverTrackDOM.showError(
            this.elements.error,
            message,
            this.elements.content
        );
        EverTrackDOM.hide(this.elements.loading);
    }

    /**
     * Open settings page
     */
    openSettings() {
        if (chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            // Fallback for development
            console.log('EverTrack Popup: Opening settings page...');
        }
    }

    /**
     * Refresh data manually
     */
    async refresh() {
        await this.loadData();
    }
}

// Initialize popup when script loads
new EverTrackPopup();