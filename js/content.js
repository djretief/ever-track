/**
 * EverTrack Content Script
 * Integrates with Everhour interface to show progress widget
 */

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
     * Create and insert widget into page
     */
    async createWidget() {
        // Remove existing widget if present
        this.removeWidget();

        // Create widget container
        this.widget = EverTrackDOM.createElement('div', {
            className: 'evertrack-widget',
            id: 'evertrack-widget'
        });

        // Create widget HTML structure
        this.widget.innerHTML = `
            <div class="evertrack-widget-header">
                <h3 class="evertrack-widget-title">EverTrack</h3>
                <div class="evertrack-widget-controls">
                    <button class="evertrack-widget-btn" id="evertrack-refresh" title="Refresh">
                        🔄
                    </button>
                    <button class="evertrack-widget-btn" id="evertrack-minimize" title="Minimize">
                        ➖
                    </button>
                    <button class="evertrack-widget-btn" id="evertrack-close" title="Close">
                        ✕
                    </button>
                </div>
            </div>
            <div class="evertrack-widget-content">
                <div class="loading">Loading...</div>
                <div class="error hidden"></div>
                <div class="content hidden">
                    <div class="mode-label"></div>
                    <div class="progress-container">
                        <div class="progress-label">
                            <span class="worked-hours">0h</span>
                            <span class="target-hours">0h target</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-center"></div>
                            <div class="progress-fill"></div>
                            <div class="progress-text">0%</div>
                        </div>
                    </div>
                    <div class="status-info"></div>
                </div>
            </div>
        `;

        // Insert widget into page
        document.body.appendChild(this.widget);

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

        // Minimize button
        const minimizeBtn = this.widget.querySelector('#evertrack-minimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }

        // Close button
        const closeBtn = this.widget.querySelector('#evertrack-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeWidget());
        }

        // Make widget draggable
        this.makeDraggable();
    }

    /**
     * Make widget draggable
     */
    makeDraggable() {
        if (!this.widget) return;

        const header = this.widget.querySelector('.evertrack-widget-header');
        if (!header) return;

        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.style.cursor = 'move';

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = this.widget.offsetLeft;
            startTop = this.widget.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            this.widget.style.left = (startLeft + deltaX) + 'px';
            this.widget.style.top = (startTop + deltaY) + 'px';
            this.widget.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    /**
     * Toggle widget minimize state
     */
    toggleMinimize() {
        if (!this.widget) return;

        this.widget.classList.toggle('minimized');
        
        const minimizeBtn = this.widget.querySelector('#evertrack-minimize');
        if (minimizeBtn) {
            minimizeBtn.textContent = this.widget.classList.contains('minimized') ? '➕' : '➖';
            minimizeBtn.title = this.widget.classList.contains('minimized') ? 'Expand' : 'Minimize';
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
            const progress = EverTrackTime.calculateProgress(this.timeData, targetHours);

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