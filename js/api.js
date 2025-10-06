/**
 * EverTrack API Module
 * Handles all Everhour API interactions
 */

const EverTrackAPI = {
    /**
     * Fetch time data from Everhour API
     * @param {string} apiToken - Everhour API token
     * @param {string} trackingMode - 'daily', 'weekly', or 'monthly'
     * @returns {Promise<number>} - Total hours worked
     */
    async fetchTimeData(apiToken, trackingMode = 'weekly') {
        if (!apiToken) {
            throw new Error('No API token provided');
        }

        const { from, to } = this.getDateRange(trackingMode);
        console.log(`EverTrack API: Fetching ${trackingMode} data from ${from.toDateString()} to ${to.toDateString()}`);

        // Based on Everhour API documentation, try the most common patterns
        const apiAttempts = [
            // 1. Try /users/me first to validate token
            {
                name: 'User validation',
                url: 'https://api.everhour.com/users/me',
                method: 'GET'
            },
            // 2. Try /time endpoint (most likely for time tracking)
            {
                name: 'Time endpoint',
                url: `https://api.everhour.com/time?from=${this.formatDate(from)}&to=${this.formatDate(to)}`,
                method: 'GET'
            },
            // 3. Try /time without parameters
            {
                name: 'Time endpoint (no params)',
                url: 'https://api.everhour.com/time',
                method: 'GET'
            },
            // 4. Try /reports endpoint
            {
                name: 'Reports endpoint',
                url: 'https://api.everhour.com/reports',
                method: 'GET'
            }
        ];

        for (const attempt of apiAttempts) {
            try {
                console.log(`EverTrack API: Trying ${attempt.name}: ${attempt.method} ${attempt.url}`);
                
                const response = await fetch(attempt.url, {
                    method: attempt.method,
                    headers: {
                        'X-Api-Key': apiToken,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`EverTrack API: ${attempt.name} response status: ${response.status}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`EverTrack API: ${attempt.name} success:`, data);
                    
                    // If this is just user validation, continue to time endpoints
                    if (attempt.url.includes('/users/me')) {
                        console.log('EverTrack API: Token validated successfully');
                        continue;
                    }
                    
                    // Try to extract time data
                    let totalHours = 0;
                    
                    if (Array.isArray(data)) {
                        totalHours = data.reduce((total, entry) => {
                            return total + ((entry.time || entry.duration || 0) / 3600);
                        }, 0);
                    } else if (data.time !== undefined) {
                        totalHours = data.time / 3600;
                    } else if (data.duration !== undefined) {
                        totalHours = data.duration / 3600;
                    }
                    
                    console.log(`EverTrack API: Total hours calculated: ${totalHours}`);
                    return totalHours;
                } else {
                    const errorText = await response.text();
                    console.log(`EverTrack API: ${attempt.name} failed - ${response.status}: ${errorText}`);
                    
                    if (response.status === 401) {
                        throw new Error('Invalid API token. Please check your settings.');
                    } else if (response.status === 403) {
                        throw new Error('API access forbidden. Please check your token permissions.');
                    }
                    // Continue to next attempt for other errors
                }
            } catch (error) {
                console.error(`EverTrack API: ${attempt.name} error:`, error);
                
                if (error.message.includes('Invalid API token') || error.message.includes('forbidden')) {
                    throw error; // Don't retry auth errors
                }
                // Continue to next attempt for network errors
            }
        }

        throw new Error('Could not find a working API endpoint. Please check the Everhour API documentation or contact support.');
    },

    /**
     * Get date range for tracking mode
     * @param {string} trackingMode - 'daily', 'weekly', or 'monthly'
     * @returns {Object} - { from: Date, to: Date }
     */
    getDateRange(trackingMode) {
        const today = new Date();
        let from, to;

        switch (trackingMode) {
            case 'daily':
                from = to = new Date(today);
                break;
            case 'weekly':
                from = new Date(today);
                from.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                to = new Date(today);
                break;
            case 'monthly':
                from = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
                to = new Date(today);
                break;
            default:
                throw new Error(`Unknown tracking mode: ${trackingMode}`);
        }

        return { from, to };
    },

    /**
     * Format date for API request
     * @param {Date} date - Date to format
     * @returns {string} - Formatted date (YYYY-MM-DD)
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EverTrackAPI;
}
if (typeof window !== 'undefined') {
    window.EverTrackAPI = EverTrackAPI;
}