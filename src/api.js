/**
 * EverTrack API Module
 * Handles all Everhour API interactions
 */

// Prevent multiple declarations
if (!window.EverTrackAPI) {
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

      try {
        // Step 1: Get the user ID from /users/me
        console.log('EverTrack API: Getting user ID from /users/me');
        const userResponse = await fetch('https://api.everhour.com/users/me', {
          method: 'GET',
          headers: {
            'X-Api-Key': apiToken,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error(`EverTrack API: User endpoint failed - ${userResponse.status}: ${errorText}`);

          if (userResponse.status === 401) {
            throw new Error('Invalid API token. Please check your settings.');
          } else if (userResponse.status === 403) {
            throw new Error('API access forbidden. Please check your token permissions.');
          } else {
            throw new Error(`Failed to authenticate: ${userResponse.status} ${errorText}`);
          }
        }

        const userData = await userResponse.json();
        console.log('EverTrack API: User data received:', userData);

        const userId = userData.id;
        if (!userId) {
          throw new Error('User ID not found in response');
        }

        // Step 2: Get time records using the user ID
        const fromDate = this.formatDate(from);
        const toDate = this.formatDate(to);
        const timeUrl = `https://api.everhour.com/users/${userId}/time?from=${fromDate}&to=${toDate}&limit=10000&page=1`;

        console.log(`EverTrack API: Fetching time records from ${timeUrl}`);
        const timeResponse = await fetch(timeUrl, {
          method: 'GET',
          headers: {
            'X-Api-Key': apiToken,
            'Content-Type': 'application/json',
          },
        });

        if (!timeResponse.ok) {
          const errorText = await timeResponse.text();
          console.error(`EverTrack API: Time records endpoint failed - ${timeResponse.status}: ${errorText}`);
          throw new Error(`Failed to fetch time records: ${timeResponse.status} ${errorText}`);
        }

        const timeData = await timeResponse.json();
        console.log('EverTrack API: Time records received:', timeData);

        // Step 3: Calculate total hours from the time records
        let totalHours = 0;

        if (Array.isArray(timeData)) {
          totalHours = timeData.reduce((total, entry) => {
            // Time is typically stored in seconds in Everhour API
            const entryHours = (entry.time || entry.duration || 0) / 3600;
            return total + entryHours;
          }, 0);
        } else {
          console.warn('EverTrack API: Expected array of time records, got:', typeof timeData);
        }

        console.log(`EverTrack API: Total hours calculated: ${totalHours}`);
        return totalHours;
      } catch (error) {
        console.error('EverTrack API: Error fetching time data:', error);
        throw error;
      }
    },

    /**
     * Get date range for tracking mode
     * @param {string} mode - Tracking mode ('daily', 'weekly', 'monthly')
     * @returns {Object} - Date range with from and to dates
     */
    getDateRange(mode) {
      const today = new Date();
      let from, to;

      switch (mode) {
        case 'daily':
        from = new Date(today);
          from.setHours(0, 0, 0, 0);
        to = new Date(today);
        to.setHours(23, 59, 59, 999);
        break;

      case 'weekly': {
        from = new Date(today);
        // Change from Sunday-based to Monday-based week
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, else go back (day - 1) days
        from.setDate(today.getDate() - daysFromMonday);
          from.setHours(0, 0, 0, 0);

        to = new Date(today);
          to.setHours(23, 59, 59, 999);
          break;
      }

      case 'monthly':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        from.setHours(0, 0, 0, 0);
          to = new Date(today);
        to.setHours(23, 59, 59, 999);
        break;

      default:
          from = to = today;
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
    },
  };

  // Export for use in different contexts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EverTrackAPI;
  }
  if (typeof window !== 'undefined') {
    window.EverTrackAPI = EverTrackAPI;
  }
}
