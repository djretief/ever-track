/**
 * EverTrack Settings Module
 * Handles settings management and storage
 */

// Prevent multiple declarations
if (!window.EverTrackSettings) {

const EverTrackSettings = {
    /**
     * Default settings configuration
     */
    defaults: {
        apiToken: '',
        trackingMode: 'weekly',
        dailyTarget: 8,
        weeklyTarget: 38,
        monthlyTarget: 160,
        workSchedule: {
            monday: { enabled: true, start: '09:00', end: '17:00' },
            tuesday: { enabled: true, start: '09:00', end: '17:00' },
            wednesday: { enabled: true, start: '09:00', end: '17:00' },
            thursday: { enabled: true, start: '09:00', end: '17:00' },
            friday: { enabled: true, start: '09:00', end: '17:00' },
            saturday: { enabled: false, start: '09:00', end: '17:00' },
            sunday: { enabled: false, start: '09:00', end: '17:00' }
        }
    },

    /**
     * Load settings from storage
     * @returns {Promise<Object>} - Settings object
     */
    async load() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(this.defaults, (settings) => {
                console.log('EverTrack Settings: Loaded settings:', settings);
                resolve(settings);
            });
        });
    },

    /**
     * Save settings to storage
     * @param {Object} settings - Settings to save
     * @returns {Promise<void>}
     */
    async save(settings) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(settings, () => {
                if (chrome.runtime.lastError) {
                    console.error('EverTrack Settings: Error saving settings:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    console.log('EverTrack Settings: Settings saved successfully');
                    resolve();
                }
            });
        });
    },

    /**
     * Get target hours for current tracking mode
     * @param {Object} settings - Settings object
     * @returns {number} - Target hours
     */
    getTargetHours(settings) {
        switch (settings.trackingMode) {
            case 'daily':
                return settings.dailyTarget;
            case 'weekly':
                return settings.weeklyTarget;
            case 'monthly':
                return settings.monthlyTarget;
            default:
                return settings.weeklyTarget;
        }
    },

    /**
     * Validate settings
     * @param {Object} settings - Settings to validate
     * @returns {Array<string>} - Array of validation errors
     */
    validate(settings) {
        const errors = [];

        if (!settings.apiToken || settings.apiToken.trim() === '') {
            errors.push('API token is required');
        }

        if (settings.dailyTarget <= 0 || settings.dailyTarget > 24) {
            errors.push('Daily target must be between 1 and 24 hours');
        }

        if (settings.weeklyTarget <= 0 || settings.weeklyTarget > 168) {
            errors.push('Weekly target must be between 1 and 168 hours');
        }

        if (settings.monthlyTarget <= 0 || settings.monthlyTarget > 744) {
            errors.push('Monthly target must be between 1 and 744 hours');
        }

        if (!['daily', 'weekly', 'monthly'].includes(settings.trackingMode)) {
            errors.push('Invalid tracking mode');
        }

        return errors;
    },

    /**
     * Reset settings to defaults
     * @returns {Promise<void>}
     */
    async reset() {
        await this.save(this.defaults);
    }
};

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EverTrackSettings;
}
if (typeof window !== 'undefined') {
    window.EverTrackSettings = EverTrackSettings;
}

/**
 * EverTrack Settings Page Script
 * Refactored to use modular architecture
 */

class EverTrackSettingsPage {
    constructor() {
        this.elements = {};
        this.settings = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize settings page
     */
    async init() {
        console.log('EverTrack Settings: Initializing...');
        
        this.bindElements();
        this.bindEvents();
        await this.loadSettings();
        this.populateForm();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements = {
            form: document.getElementById('settings-form'),
            apiToken: document.getElementById('api-token'),
            trackingMode: document.getElementById('tracking-mode'),
            dailyTarget: document.getElementById('daily-target'),
            weeklyTarget: document.getElementById('weekly-target'),
            monthlyTarget: document.getElementById('monthly-target'),
            saveButton: document.getElementById('save-settings'),
            resetButton: document.getElementById('reset-settings'),
            testButton: document.getElementById('test-connection'),
            message: document.getElementById('message'),
            scheduleCheckboxes: document.querySelectorAll('.schedule-enabled'),
            scheduleStartTimes: document.querySelectorAll('.schedule-start'),
            scheduleEndTimes: document.querySelectorAll('.schedule-end')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Save button
        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener('click', () => this.saveSettings());
        }

        // Reset button
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => this.resetSettings());
        }

        // Test connection button
        if (this.elements.testButton) {
            this.elements.testButton.addEventListener('click', () => this.testConnection());
        }

        // Real-time validation
        if (this.elements.apiToken) {
            this.elements.apiToken.addEventListener('input', 
                EverTrackDOM.debounce(() => this.validateForm(), 500)
            );
        }

        // Update targets when tracking mode changes
        if (this.elements.trackingMode) {
            this.elements.trackingMode.addEventListener('change', () => {
                this.updateTargetVisibility();
            });
        }
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            this.settings = await EverTrackSettings.load();
            console.log('EverTrack Settings: Settings loaded:', this.settings);
        } catch (error) {
            console.error('EverTrack Settings: Error loading settings:', error);
            this.showMessage('Error loading settings', 'error');
        }
    }

    /**
     * Populate form with current settings
     */
    populateForm() {
        if (!this.settings) return;

        // Basic settings
        if (this.elements.apiToken) {
            this.elements.apiToken.value = this.settings.apiToken || '';
        }
        
        if (this.elements.trackingMode) {
            this.elements.trackingMode.value = this.settings.trackingMode || 'weekly';
        }
        
        if (this.elements.dailyTarget) {
            this.elements.dailyTarget.value = this.settings.dailyTarget || 8;
        }
        
        if (this.elements.weeklyTarget) {
            this.elements.weeklyTarget.value = this.settings.weeklyTarget || 38;
        }
        
        if (this.elements.monthlyTarget) {
            this.elements.monthlyTarget.value = this.settings.monthlyTarget || 160;
        }

        // Work schedule
        this.populateWorkSchedule();
        
        // Update UI
        this.updateTargetVisibility();
    }

    /**
     * Populate work schedule form
     */
    populateWorkSchedule() {
        if (!this.settings.workSchedule) return;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach((day, index) => {
            const daySchedule = this.settings.workSchedule[day];
            if (!daySchedule) return;

            // Enabled checkbox
            const enabledCheckbox = document.getElementById(`${day}-enabled`);
            if (enabledCheckbox) {
                enabledCheckbox.checked = daySchedule.enabled;
            }

            // Start time
            const startTime = document.getElementById(`${day}-start`);
            if (startTime) {
                startTime.value = daySchedule.start || '09:00';
            }

            // End time
            const endTime = document.getElementById(`${day}-end`);
            if (endTime) {
                endTime.value = daySchedule.end || '17:00';
            }
        });
    }

    /**
     * Update target visibility based on tracking mode
     */
    updateTargetVisibility() {
        const mode = this.elements.trackingMode?.value || 'weekly';
        
        // Show/hide target inputs based on mode
        const dailyGroup = document.getElementById('daily-target-group');
        const weeklyGroup = document.getElementById('weekly-target-group');
        const monthlyGroup = document.getElementById('monthly-target-group');

        if (dailyGroup) dailyGroup.style.display = mode === 'daily' ? 'block' : 'none';
        if (weeklyGroup) weeklyGroup.style.display = mode === 'weekly' ? 'block' : 'none';
        if (monthlyGroup) monthlyGroup.style.display = mode === 'monthly' ? 'block' : 'none';
    }

    /**
     * Validate form inputs
     * @returns {Array<string>} - Validation errors
     */
    validateForm() {
        const errors = [];
        
        // API Token validation
        const apiToken = this.elements.apiToken?.value.trim() || '';
        if (!apiToken) {
            errors.push('API token is required');
        }

        // Target validation
        const dailyTarget = parseFloat(this.elements.dailyTarget?.value) || 0;
        const weeklyTarget = parseFloat(this.elements.weeklyTarget?.value) || 0;
        const monthlyTarget = parseFloat(this.elements.monthlyTarget?.value) || 0;

        if (dailyTarget <= 0 || dailyTarget > 24) {
            errors.push('Daily target must be between 1 and 24 hours');
        }
        
        if (weeklyTarget <= 0 || weeklyTarget > 168) {
            errors.push('Weekly target must be between 1 and 168 hours');
        }
        
        if (monthlyTarget <= 0 || monthlyTarget > 744) {
            errors.push('Monthly target must be between 1 and 744 hours');
        }

        return errors;
    }

    /**
     * Save settings to storage
     */
    async saveSettings() {
        try {
            // Validate form
            const errors = this.validateForm();
            if (errors.length > 0) {
                this.showMessage(errors[0], 'error');
                return;
            }

            // Collect form data
            const settings = {
                apiToken: this.elements.apiToken?.value.trim() || '',
                trackingMode: this.elements.trackingMode?.value || 'weekly',
                dailyTarget: parseFloat(this.elements.dailyTarget?.value) || 8,
                weeklyTarget: parseFloat(this.elements.weeklyTarget?.value) || 38,
                monthlyTarget: parseFloat(this.elements.monthlyTarget?.value) || 160,
                workSchedule: this.collectWorkSchedule()
            };

            // Save to storage
            await EverTrackSettings.save(settings);
            
            this.settings = settings;
            this.showMessage('Settings saved successfully!', 'success');
            
            console.log('EverTrack Settings: Settings saved:', settings);

        } catch (error) {
            console.error('EverTrack Settings: Error saving settings:', error);
            this.showMessage(`Error saving settings: ${error.message}`, 'error');
        }
    }

    /**
     * Collect work schedule from form
     * @returns {Object} - Work schedule object
     */
    collectWorkSchedule() {
        const schedule = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const enabledCheckbox = document.getElementById(`${day}-enabled`);
            const startTime = document.getElementById(`${day}-start`);
            const endTime = document.getElementById(`${day}-end`);
            
            schedule[day] = {
                enabled: enabledCheckbox?.checked || false,
                start: startTime?.value || '09:00',
                end: endTime?.value || '17:00'
            };
        });
        
        return schedule;
    }

    /**
     * Reset settings to defaults
     */
    async resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults?')) {
            return;
        }

        try {
            await EverTrackSettings.reset();
            await this.loadSettings();
            this.populateForm();
            this.showMessage('Settings reset to defaults', 'success');
        } catch (error) {
            console.error('EverTrack Settings: Error resetting settings:', error);
            this.showMessage(`Error resetting settings: ${error.message}`, 'error');
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        const apiToken = this.elements.apiToken?.value.trim();
        
        if (!apiToken) {
            this.showMessage('Please enter an API token first', 'warning');
            return;
        }

        // Disable button and show loading
        if (this.elements.testButton) {
            this.elements.testButton.disabled = true;
            this.elements.testButton.textContent = 'Testing...';
        }

        try {
            // Test API connection
            await EverTrackAPI.fetchTimeData(apiToken, 'daily');
            this.showMessage('Connection successful! ✓', 'success');
        } catch (error) {
            console.error('EverTrack Settings: Connection test failed:', error);
            this.showMessage(`Connection failed: ${error.message}`, 'error');
        } finally {
            // Re-enable button
            if (this.elements.testButton) {
                this.elements.testButton.disabled = false;
                this.elements.testButton.textContent = 'Test Connection';
            }
        }
    }

    /**
     * Show message to user
     * @param {string} text - Message text
     * @param {string} type - Message type ('success', 'error', 'warning')
     */
    showMessage(text, type = 'success') {
        if (!this.elements.message) return;

        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
        EverTrackDOM.show(this.elements.message);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            EverTrackDOM.hide(this.elements.message);
        }, 5000);
    }
}

// Initialize settings page when script loads (only if in settings page context)
if (document.getElementById('settings-form')) {
    new EverTrackSettingsPage();
}

}