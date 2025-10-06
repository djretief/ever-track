/**
 * EverTrack Content Script
 * Integrates with Everhour interface to show progress widget
 */

// Prevent multiple script initialization
if (window.everTrackContentScriptLoaded) {
    console.log('EverTrack Content Script: Already loaded, skipping initialization');
} else {
    window.everTrackContentScriptLoaded = true;

class EverTrackContentScript {
    constructor() {
        this.widget = null;
        this.settings = null;
        this.timeData = null;
        this.updateInterval = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize content script
     */
    async init() {
        console.log('EverTrack Content Script: Initializing on', window.location.hostname);
        
        // Only run on Everhour domains
        if (!this.isEverhourDomain()) {
            console.log('EverTrack Content Script: Not on Everhour domain, exiting');
            return;
        }

        // Load CSS
        this.loadCSS();
        
        // Load settings and create widget
        await this.loadSettings();
        
        if (this.settings && this.settings.apiToken) {
            await this.createWidget();
            this.startAutoUpdate();
        }

        // Listen for settings changes
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync') {
                this.handleSettingsChange();
            }
        });
    }

    /**
     * Check if current domain is Everhour
     * @returns {boolean}
     */
    isEverhourDomain() {
        const hostname = window.location.hostname.toLowerCase();
        return hostname.includes('everhour.com') || 
               hostname.includes('app.everhour') ||
               hostname === 'localhost' || // For development
               hostname.includes('127.0.0.1'); // For development
    }

    /**
     * Load CSS for content script
     */
    loadCSS() {
        const cssUrl = chrome.runtime.getURL('css/content.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            this.settings = await EverTrackSettings.load();
            console.log('EverTrack Content Script: Settings loaded:', this.settings);
        } catch (error) {
            console.error('EverTrack Content Script: Error loading settings:', error);
        }
    }

    /**
     * Find the best insertion point for the widget in Everhour interface
     */
    async findInsertionPoint() {
        console.log('EverTrack: Looking for insertion point...');
        
        // Primary target: find the outer-component element and its container
        let i = 3;
        let outerComponent = null;
        while(outerComponent === null && i-- > 0) {
            outerComponent = document.querySelector('.outer-component');
            if (!outerComponent) {
                // Wait for 100ms before trying again
                i++;
                await new Promise(resolve => setTimeout(resolve, 100));
            } else {
                break;
            }
        }
        console.log(`EverTrack: Outer component:`, outerComponent);
        
        if (outerComponent) {
            const container = outerComponent.closest('.container');
            console.log('EverTrack: Container found:', !!container);
            if (container) {
                console.log('EverTrack: Found container with outer-component');
                return { container, insertBefore: outerComponent };
            }
        }
    }

    /**
     * Create and insert widget into page
     */
    async createWidget() {
        // Remove existing widget if present
        this.removeWidget();

        // Create widget container
        this.widget = EverTrackDOM.createElement('div', {
            className: 'evertrack-widget evertrack-inline',
            id: 'evertrack-widget'
        });

        // Create widget HTML structure
        this.widget.innerHTML = `
            <div class="evertrack-widget-header">
                <h3 class="evertrack-widget-title">EverTrack Progress</h3>
                <div class="evertrack-widget-controls">
                    <button class="evertrack-widget-btn" id="evertrack-refresh" title="Refresh">
                        🔄
                    </button>
                    <button class="evertrack-widget-btn" id="evertrack-close" title="Hide">
                        ✕
                    </button>
                </div>
            </div>
            <div class="evertrack-widget-content">
                <div class="loading">Loading...</div>
                <div class="error hidden"></div>
                <div class="hidden">
                    <div class="mode-label"></div>
                    <div class="progress-container">
                        <div class="progress-label">
                            <span class="worked-hours">0h</span>
                            <span class="target-hours">0h target</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-center"></div>
                            <div class="progress-fill">
                                <div class="progress-text">0%</div>
                            </div>
                        </div>
                    </div>
                    <div class="status-info"></div>
                </div>
            </div>
        `;

        // Find the best insertion point
        const insertionInfo = await this.findInsertionPoint();
        
        if (!insertionInfo) {
            console.log('EverTrack: Could not find insertion point');
            return;
        }
        
        console.log('EverTrack: Inserting widget with info:', insertionInfo);
        
        // Insert widget into the container, before the outer-component element
        if (insertionInfo.insertBefore) {
            // Insert before the specific element (outer-component)
            insertionInfo.container.insertBefore(this.widget, insertionInfo.insertBefore);
            console.log('EverTrack: Widget inserted before target element');
        } else if (insertionInfo.container === document.body) {
            // If we're inserting into body, prepend it
            document.body.insertBefore(this.widget, document.body.firstChild);
            console.log('EverTrack: Widget inserted at beginning of body');
        } else {
            // Insert at the beginning of the container
            insertionInfo.container.insertBefore(this.widget, insertionInfo.container.firstChild);
            console.log('EverTrack: Widget inserted at beginning of container');
        }

        // Bind widget events
        this.bindWidgetEvents();

        // Load and display data
        await this.updateWidget();
    }

    /**
     * Bind widget event listeners
     */
    bindWidgetEvents() {
        if (!this.widget) return;

        // Refresh button
        const refreshBtn = this.widget.querySelector('#evertrack-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateWidget());
        }

        // Close button
        const closeBtn = this.widget.querySelector('#evertrack-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeWidget());
        }
    }

    /**
     * Update widget with current data
     */
    async updateWidget() {
        if (!this.widget || !this.settings) return;

        const elements = {
            loading: this.widget.querySelector('.loading'),
            error: this.widget.querySelector('.error'),
            content: this.widget.querySelector('.content'),
            modeLabel: this.widget.querySelector('.mode-label'),
            workedHours: this.widget.querySelector('.worked-hours'),
            targetHours: this.widget.querySelector('.target-hours'),
            progressFill: this.widget.querySelector('.progress-fill'),
            progressText: this.widget.querySelector('.progress-text'),
            statusInfo: this.widget.querySelector('.status-info')
        };

        try {
            // Show loading
            EverTrackDOM.showLoading(elements.loading, elements.content);
            EverTrackDOM.hide(elements.error);

            // Validate settings
            const validationErrors = EverTrackSettings.validate(this.settings);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors[0]);
            }

            // Fetch time data
            this.timeData = await EverTrackAPI.fetchTimeData(
                this.settings.apiToken,
                this.settings.trackingMode
            );

            // Calculate progress
            const targetHours = EverTrackSettings.getTargetHours(this.settings);
            const progress = EverTrackTime.calculateProgress(this.timeData, targetHours, this.settings.trackingMode, this.settings.workSchedule);

            // Update display
            EverTrackDOM.showContent(elements.content, elements.loading, elements.error);
            
            const displayElements = {
                ...elements,
                trackingMode: this.settings.trackingMode
            };
            
            EverTrackDOM.updateProgressBar(displayElements, progress);

            // Update mode label with period description
            const periodDescription = EverTrackTime.getPeriodDescription(this.settings.trackingMode);
            EverTrackDOM.setText(elements.modeLabel, `${this.settings.trackingMode} (${periodDescription})`);

            console.log('EverTrack Content Script: Widget updated successfully');

        } catch (error) {
            console.error('EverTrack Content Script: Error updating widget:', error);
            EverTrackDOM.showError(elements.error, error.message, elements.content);
            EverTrackDOM.hide(elements.loading);
        }
    }

    /**
     * Remove widget from page
     */
    removeWidget() {
        if (this.widget) {
            this.widget.remove();
            this.widget = null;
        }
        this.stopAutoUpdate();
    }

    /**
     * Start auto-update interval
     */
    startAutoUpdate() {
        this.stopAutoUpdate();
        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.updateWidget();
        }, 5 * 60 * 1000);
    }

    /**
     * Stop auto-update interval
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Handle settings changes
     */
    async handleSettingsChange() {
        console.log('EverTrack Content Script: Settings changed, updating...');
        await this.loadSettings();
        
        if (this.settings && this.settings.apiToken) {
            if (!this.widget) {
                await this.createWidget();
                this.startAutoUpdate();
            } else {
                await this.updateWidget();
            }
        } else {
            this.removeWidget();
        }
    }
}

// Initialize content script when script loads
new EverTrackContentScript();

}