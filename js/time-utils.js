/**
 * EverTrack Time Utilities Module
 * Handles time calculations and formatting
 */

// Prevent multiple declarations
if (!window.EverTrackTime) {

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
        
        // Round to nearest 0.1 hour for cleaner display
        const roundedHours = Math.round(hours * 10) / 10;
        
        if (showMinutes) {
            const wholeHours = Math.floor(Math.abs(roundedHours));
            const minutes = Math.round((Math.abs(roundedHours) - wholeHours) * 60);
            
            let result = '';
            if (roundedHours < 0) result += '-';
            
            if (wholeHours > 0) {
                result += `${wholeHours}h`;
            }
            
            if (minutes > 0) {
                result += ` ${minutes}m`;
            }
            
            return result || '0h';
        } else {
            // Show as decimal hours (e.g., "7.5h")
            const prefix = roundedHours < 0 ? '-' : '';
            return `${prefix}${Math.abs(roundedHours)}h`;
        }
    },

    /**
     * Calculate progress percentage based on worked hours vs target
     * @param {number} workedHours - Hours worked
     * @param {number} targetHours - Target hours
     * @param {string} trackingMode - 'daily', 'weekly', or 'monthly'
     * @param {Object} workSchedule - Work schedule configuration
     * @returns {Object} - Progress calculation result
     */
    calculateProgress(workedHours, targetHours, trackingMode, workSchedule) {
        const expectedHours = this.calculateExpectedHours(trackingMode, workSchedule, targetHours);
        const difference = workedHours - expectedHours;
        const progressPercentage = expectedHours > 0 ? (workedHours / expectedHours) * 100 : 0;
        
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
            expectedHours,
            difference,
            progressPercentage,
            fillWidth,
            isOverTarget,
            className,
            scale,
            formattedWorked: this.formatHours(workedHours, true),
            formattedTarget: this.formatHours(targetHours),
            formattedDifference: this.formatHours(difference, true),
            formattedExpected: this.formatHours(expectedHours, true),
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
     * Calculate expected hours based on work schedule progress
     * @param {string} trackingMode - 'daily', 'weekly', or 'monthly'
     * @param {Object} workSchedule - Work schedule configuration
     * @param {number} targetHours - Total target hours for the period
     * @returns {number} - Expected hours based on progress through period
     */
    calculateExpectedHours(trackingMode, workSchedule, targetHours = 0) {
        const now = new Date();
        
        switch (trackingMode) {
            case 'daily':
                return this.calculateDailyExpectedHours(now, workSchedule, targetHours);
                
            case 'weekly':
                return this.calculateWeeklyExpectedHours(now, workSchedule, targetHours);
                
            case 'monthly':
                return this.calculateMonthlyExpectedHours(now, workSchedule, targetHours);
                
            default:
                return 0;
        }
    },

    /**
     * Calculate expected hours for daily tracking
     * @param {Date} now - Current date/time
     * @param {Object} workSchedule - Work schedule configuration
     * @param {number} targetHours - Daily target hours
     * @returns {number} - Expected hours based on progress through workday
     */
    calculateDailyExpectedHours(now, workSchedule, targetHours) {
        console.log('EverTrack Time: Daily calculation - now:', now.toString(), 'targetHours:', targetHours);
    
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        const daySchedule = workSchedule[dayName];
    
        console.log('EverTrack Time: Day schedule for', dayName, ':', daySchedule);
    
        // If today is not a work day, expected hours is 0
        if (!daySchedule || !daySchedule.enabled) {
            console.log('EverTrack Time: Not a work day, returning 0');
            return 0;
        }
    
        const startTime = this.parseTime(daySchedule.start);
        const endTime = this.parseTime(daySchedule.end);
    
        console.log('EverTrack Time: Work hours -', startTime.toString(), 'to', endTime.toString());
        console.log('EverTrack Time: Current time vs work start:', now >= startTime, 'vs work end:', now >= endTime);
    
        // If current time is before work start, expected hours is 0
        if (now < startTime) {
            console.log('EverTrack Time: Before work starts, returning 0');
            return 0;
        }
    
        // If current time is after work end, expected hours is full target
        if (now >= endTime) {
            console.log('EverTrack Time: After work ends, returning full target:', targetHours);
            return targetHours;
        }
    
        // Calculate fraction of workday completed
        const totalWorkTime = endTime - startTime;
        const elapsedWorkTime = now - startTime;
        const fractionComplete = elapsedWorkTime / totalWorkTime;
    
        const expectedHours = targetHours * fractionComplete;
    
        console.log('EverTrack Time: Work progress - fraction:', fractionComplete, 'expected hours:', expectedHours);
    
        return expectedHours;
    },

    /**
     * Calculate expected hours for weekly tracking
     * @param {Date} now - Current date/time
     * @param {Object} workSchedule - Work schedule configuration
     * @param {number} targetHours - Weekly target hours
     * @returns {number} - Expected hours based on progress through work week
     */
    calculateWeeklyExpectedHours(now, workSchedule, targetHours) {
        const weekStart = new Date(now);
        // Change from Sunday-based to Monday-based week
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, else go back (day - 1) days
        weekStart.setDate(now.getDate() - daysFromMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Calculate total work hours in the week
        const totalWorkHours = this.calculateTotalWorkHoursInPeriod(weekStart, weekEnd, workSchedule);
        
        // Calculate work hours that should be completed by now
        const completedWorkHours = this.calculateCompletedWorkHours(weekStart, now, workSchedule);
        
        if (totalWorkHours === 0) return 0;
        
        // Calculate fraction of work week completed
        const fractionComplete = completedWorkHours / totalWorkHours;
        
        return targetHours * fractionComplete;
    },

    /**
     * Calculate expected hours for monthly tracking
     * @param {Date} now - Current date/time
     * @param {Object} workSchedule - Work schedule configuration
     * @param {number} targetHours - Monthly target hours
     * @returns {number} - Expected hours based on progress through work month
     */
    calculateMonthlyExpectedHours(now, workSchedule, targetHours) {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        // Calculate total work hours in the month
        const totalWorkHours = this.calculateTotalWorkHoursInPeriod(monthStart, monthEnd, workSchedule);
        
        // Calculate work hours that should be completed by now
        const completedWorkHours = this.calculateCompletedWorkHours(monthStart, now, workSchedule);
        
        if (totalWorkHours === 0) return 0;
        
        // Calculate fraction of work month completed
        const fractionComplete = completedWorkHours / totalWorkHours;
        
        return targetHours * fractionComplete;
    },

    /**
     * Calculate total work hours in a given period
     * @param {Date} startDate - Period start date
     * @param {Date} endDate - Period end date
     * @param {Object} workSchedule - Work schedule configuration
     * @returns {number} - Total work hours in the period
     */
    calculateTotalWorkHoursInPeriod(startDate, endDate, workSchedule) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let totalHours = 0;
        
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayName = dayNames[currentDate.getDay()];
            const daySchedule = workSchedule[dayName];
            
            if (daySchedule && daySchedule.enabled) {
                const startTime = this.parseTime(daySchedule.start);
                const endTime = this.parseTime(daySchedule.end);
                const dayHours = (endTime - startTime) / (1000 * 60 * 60);
                totalHours += dayHours;
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return totalHours;
    },

    /**
     * Calculate work hours that should be completed by a given time
     * @param {Date} startDate - Period start date
     * @param {Date} currentTime - Current date/time
     * @param {Object} workSchedule - Work schedule configuration
     * @returns {number} - Work hours that should be completed
     */
    calculateCompletedWorkHours(startDate, currentTime, workSchedule) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let completedHours = 0;
        
        const currentDate = new Date(startDate);
        while (currentDate < currentTime) {
            const dayName = dayNames[currentDate.getDay()];
            const daySchedule = workSchedule[dayName];
            
            if (daySchedule && daySchedule.enabled) {
                const workDay = new Date(currentDate);
                const startTime = this.parseTime(daySchedule.start);
                const endTime = this.parseTime(daySchedule.end);
                
                // Set the work start and end times for this specific day
                const dayStart = new Date(workDay);
                dayStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
                
                const dayEnd = new Date(workDay);
                dayEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
                
                // Check if this is today and we're in the middle of a work day
                if (currentDate.toDateString() === currentTime.toDateString()) {
                    // This is today - calculate partial day progress
                    if (currentTime < dayStart) {
                        // Before work starts today - no hours from today
                        break;
                    } else if (currentTime >= dayEnd) {
                        // After work ends today - full day
                        const dayHours = (dayEnd - dayStart) / (1000 * 60 * 60);
                        completedHours += dayHours;
                    } else {
                        // During work hours today - partial day
                        const elapsedHours = (currentTime - dayStart) / (1000 * 60 * 60);
                        completedHours += elapsedHours;
                    }
                    break;
                } else {
                    // This is a previous day - add full day hours
                    const dayHours = (dayEnd - dayStart) / (1000 * 60 * 60);
                    completedHours += dayHours;
                }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return completedHours;
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
                // Change from Sunday-based to Monday-based week
                const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, else go back (day - 1) days
                weekStart.setDate(today.getDate() - daysFromMonday);
                
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

}