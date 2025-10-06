/**
 * EverTrack Time Utilities Module
 * Handles time calculations and formatting
 */

const EverTrackTime = {
    /**
     * Maximum hours scale for progress bar (±20 hours = full scale)
     */
    MAX_HOURS_SCALE: 20,

    /**
     * Format hours to human-readable string
     * @param {number} hours - Hours to format
     * @param {boolean} showMinutes - Whether to show minutes
     * @returns {string} - Formatted time string
     */
    formatHours(hours, showMinutes = false) {
        if (hours === 0) return '0h';
        
        const wholeHours = Math.floor(Math.abs(hours));
        const minutes = Math.round((Math.abs(hours) - wholeHours) * 60);
        
        let result = '';
        if (hours < 0) result += '-';
        
        if (wholeHours > 0) {
            result += `${wholeHours}h`;
        }
        
        if (showMinutes && minutes > 0) {
            result += ` ${minutes}m`;
        }
        
        return result || '0h';
    },

    /**
     * Calculate progress percentage based on worked hours vs target
     * @param {number} workedHours - Hours worked
     * @param {number} targetHours - Target hours
     * @returns {Object} - Progress calculation result
     */
    calculateProgress(workedHours, targetHours) {
        const difference = workedHours - targetHours;
        const progressPercentage = targetHours > 0 ? (workedHours / targetHours) * 100 : 0;
        
        // Calculate fill width based on hours difference (±20h = full scale)
        const fillWidth = Math.min(Math.abs(difference) / this.MAX_HOURS_SCALE * 50, 50);
        
        // Determine if over or under target
        const isOverTarget = difference >= 0;
        const className = isOverTarget ? 'over-target' : 'under-target';
        
        // Calculate transform scale for CSS
        const scale = fillWidth / 50;
        
        return {
            workedHours,
            targetHours,
            difference,
            progressPercentage,
            fillWidth,
            isOverTarget,
            className,
            scale,
            formattedWorked: this.formatHours(workedHours, true),
            formattedTarget: this.formatHours(targetHours),
            formattedDifference: this.formatHours(difference, true),
            status: this.getStatus(difference, targetHours)
        };
    },

    /**
     * Get status message based on progress
     * @param {number} difference - Difference between worked and target hours
     * @param {number} targetHours - Target hours
     * @returns {string} - Status message
     */
    getStatus(difference, targetHours) {
        if (targetHours === 0) {
            return 'No target set';
        }
        
        if (Math.abs(difference) < 0.1) {
            return 'Right on target! 🎯';
        }
        
        if (difference > 0) {
            return `${this.formatHours(difference, true)} over target 📈`;
        } else {
            return `${this.formatHours(Math.abs(difference), true)} behind target 📉`;
        }
    },

    /**
     * Calculate working days between two dates
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} workSchedule - Work schedule configuration
     * @returns {number} - Number of working days
     */
    calculateWorkingDays(startDate, endDate, workSchedule) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let workingDays = 0;
        
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayName = dayNames[currentDate.getDay()];
            if (workSchedule[dayName] && workSchedule[dayName].enabled) {
                workingDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return workingDays;
    },

    /**
     * Calculate expected hours based on work schedule
     * @param {string} trackingMode - 'daily', 'weekly', or 'monthly'
     * @param {Object} workSchedule - Work schedule configuration
     * @returns {number} - Expected hours
     */
    calculateExpectedHours(trackingMode, workSchedule) {
        const today = new Date();
        
        switch (trackingMode) {
            case 'daily':
                const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
                const daySchedule = workSchedule[dayName];
                if (!daySchedule || !daySchedule.enabled) return 0;
                
                const start = this.parseTime(daySchedule.start);
                const end = this.parseTime(daySchedule.end);
                return (end - start) / (1000 * 60 * 60); // Convert to hours
                
            case 'weekly':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                return this.calculateWorkingDays(weekStart, today, workSchedule) * 8; // Assuming 8h per day
                
            case 'monthly':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return this.calculateWorkingDays(monthStart, today, workSchedule) * 8; // Assuming 8h per day
                
            default:
                return 0;
        }
    },

    /**
     * Parse time string (HH:MM) to Date object
     * @param {string} timeString - Time in HH:MM format
     * @returns {Date} - Date object for today with the specified time
     */
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    },

    /**
     * Get current period description
     * @param {string} trackingMode - 'daily', 'weekly', or 'monthly'
     * @returns {string} - Period description
     */
    getPeriodDescription(trackingMode) {
        const today = new Date();
        
        switch (trackingMode) {
            case 'daily':
                return today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                
            case 'weekly':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                
            case 'monthly':
                return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
            default:
                return 'Unknown period';
        }
    }
};

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EverTrackTime;
}
if (typeof window !== 'undefined') {
    window.EverTrackTime = EverTrackTime;
}