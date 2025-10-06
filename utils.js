// Shared utilities for EverTrack extension
// Used by both popup.js and content.js

const EverTrackUtils = {
    // Load settings from storage
    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                'apiToken',
                'targetHours',
                'workSchedule',
                'trackingMode',
                'dailyTarget',
                'weeklyTarget',
                'monthlyTarget'
            ], (result) => {
                resolve({
                    apiToken: result.apiToken || '',
                    targetHours: result.targetHours || 8,
                    workSchedule: result.workSchedule || null,
                    trackingMode: result.trackingMode || 'weekly',
                    dailyTarget: result.dailyTarget || 8,
                    weeklyTarget: result.weeklyTarget || 40,
                    monthlyTarget: result.monthlyTarget || 160
                });
            });
        });
    },

    // Fetch time data - works in both popup and content script contexts
    async fetchTimeData(apiToken, trackingMode = 'weekly') {
        if (!apiToken) {
            throw new Error('No API token provided');
        }

        const today = new Date();
        let from, to;
        
        // Calculate date range based on tracking mode
        switch (trackingMode) {
            case 'daily':
                from = to = today;
                break;
            case 'weekly':
                from = new Date(today);
                from.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                to = today;
                break;
            case 'monthly':
                from = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
                to = today;
                break;
            default:
                from = new Date(today);
                from.setDate(today.getDate() - today.getDay());
                to = today;
        }
        
        // Format dates for API
        const formatDate = (date) => date.toISOString().split('T')[0];
        const fromStr = formatDate(from);
        const toStr = formatDate(to);

        // Check if we're in a content script context
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage && !window.chrome?.extension?.getBackgroundPage) {
            // We're in a content script - use background script
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'fetchTimeData',
                    apiToken: apiToken,
                    from: fromStr,
                    to: toStr
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response?.error || 'Unknown API error'));
                    }
                });
            });
        } else {
            // We're in popup or background context - make direct fetch
            const url = `https://api.everhour.com/users/me/time?from=${fromStr}&to=${toStr}`;
            
            try {
                const response = await fetch(url, {
                    headers: {
                        'X-Api-Key': apiToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API error: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
                }

                return await response.json();
            } catch (error) {
                console.error('EverTrack: API fetch error:', error);
                throw error;
            }
        }
    },

    // Calculate progress based on time data and settings (matches popup.js logic exactly)
    calculateProgress(timeData, settings) {
        console.log('EverTrack Utils: Calculating progress with data:', timeData);
        console.log('EverTrack Utils: Settings:', settings);
        
        // Validate inputs
        if (!timeData || !Array.isArray(timeData)) {
            console.warn('EverTrack Utils: Invalid time data');
            return { worked: 0, proRatedTarget: 0, difference: 0, fullTarget: 0 };
        }
        
        // Calculate total worked hours
        const totalSeconds = timeData.reduce((total, entry) => total + (entry.time || 0), 0);
        const worked = Math.round((totalSeconds / 3600) * 100) / 100;
        
        console.log('EverTrack Utils: Total worked hours:', worked);
        
        // Calculate pro-rated target using popup's logic
        const targetInfo = this.calculateProRatedTarget(settings);
        
        console.log('EverTrack Utils: Target info:', targetInfo);
        
        const difference = worked - targetInfo.proRatedTarget;
        
        return {
            worked,
            proRatedTarget: targetInfo.proRatedTarget,
            difference,
            fullTarget: targetInfo.fullTarget,
            progress: targetInfo.progress,
            totalWorkHours: targetInfo.totalWorkHours,
            elapsedWorkHours: targetInfo.elapsedWorkHours
        };
    },

    // Calculate pro-rated target (matches popup.js logic exactly)
    calculateProRatedTarget(settings) {
        const now = new Date();
        const { trackingMode, workSchedule } = settings;
        const fullTarget = settings[`${trackingMode}Target`] || settings.targetHours || 8;
        
        console.log('EverTrack Utils: Calculating pro-rated target for mode:', trackingMode, 'fullTarget:', fullTarget);
        
        let totalWorkHours = 0;
        let elapsedWorkHours = 0;
        
        if (trackingMode === 'daily') {
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
            totalWorkHours = this.calculateWorkHoursForDay(workSchedule?.[dayOfWeek]);
            elapsedWorkHours = this.getElapsedWorkHours(now, workSchedule);
        } else if (trackingMode === 'weekly') {
            // Calculate for the week (Sunday to Saturday)
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][i];
                
                const dayWorkHours = this.calculateWorkHoursForDay(workSchedule?.[dayOfWeek]);
                totalWorkHours += dayWorkHours;
                
                if (date <= now) {
                    elapsedWorkHours += this.getElapsedWorkHours(date, workSchedule);
                }
            }
        } else if (trackingMode === 'monthly') {
            // Calculate for the month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
                const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
                const dayWorkHours = this.calculateWorkHoursForDay(workSchedule?.[dayOfWeek]);
                totalWorkHours += dayWorkHours;
                
                if (date <= now) {
                    elapsedWorkHours += this.getElapsedWorkHours(new Date(date), workSchedule);
                }
            }
        }
        
        console.log('EverTrack Utils: Total work hours:', totalWorkHours, 'Elapsed:', elapsedWorkHours);
        
        // Calculate pro-rated target
        if (totalWorkHours === 0) return { proRatedTarget: 0, progress: 0, totalWorkHours, elapsedWorkHours, fullTarget };
        
        const workProgress = elapsedWorkHours / totalWorkHours;
        const proRatedTarget = fullTarget * workProgress;
        
        return {
            proRatedTarget: Math.round(proRatedTarget * 100) / 100,
            progress: workProgress,
            totalWorkHours: Math.round(totalWorkHours * 100) / 100,
            elapsedWorkHours: Math.round(elapsedWorkHours * 100) / 100,
            fullTarget
        };
    },

    // Calculate work hours for a day (matches popup.js)
    calculateWorkHoursForDay(daySchedule) {
        if (!daySchedule || !daySchedule.enabled) return 0;
        const startHours = this.parseTimeString(daySchedule.start);
        const endHours = this.parseTimeString(daySchedule.end);
        return Math.max(0, endHours - startHours);
    },

    // Parse time string like "09:00" to decimal hours
    parseTimeString(timeString) {
        if (!timeString) return 9; // Default fallback
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + minutes / 60;
    },

    // Get elapsed work hours for a specific date (matches popup.js)
    getElapsedWorkHours(date, workSchedule) {
        if (!workSchedule) return 0;
        
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
        const daySchedule = workSchedule[dayOfWeek];
        
        if (!daySchedule || !daySchedule.enabled) return 0;
        
        const now = new Date();
        const startHour = this.parseTimeString(daySchedule.start);
        const endHour = this.parseTimeString(daySchedule.end);
        
        // If it's not today, return full day hours
        if (date.toDateString() !== now.toDateString()) {
            return date < now ? Math.max(0, endHour - startHour) : 0;
        }
        
        // For today, calculate elapsed hours
        const currentHour = now.getHours() + now.getMinutes() / 60;
        
        if (currentHour < startHour) return 0;
        if (currentHour >= endHour) return Math.max(0, endHour - startHour);
        
        return Math.max(0, currentHour - startHour);
    },

    // Parse time string (HH:MM) to minutes
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    },

    // Get work minutes between start and end times
    getWorkMinutesBetween(startMinutes, endMinutes) {
        if (endMinutes <= startMinutes) {
            return (24 * 60 - startMinutes) + endMinutes;
        }
        return endMinutes - startMinutes;
    },

    // Get elapsed work minutes from start time to now
    getElapsedWorkMinutes(startMinutes, endMinutes) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        if (currentMinutes < startMinutes) return 0;
        if (currentMinutes >= endMinutes) return this.getWorkMinutesBetween(startMinutes, endMinutes);
        
        return currentMinutes - startMinutes;
    },

    // Format status message based on progress
    getStatusMessage(difference) {
        if (isNaN(difference)) {
            console.error('EverTrack Utils: NaN difference in status message');
            return 'Calculating progress...';
        }
        
        if (difference > 0) {
            return `${difference.toFixed(1)}h ahead! 🚀`;
        } else if (difference >= 0) {
            return 'On track! 🎯';
        } else {
            return `${Math.abs(difference).toFixed(1)}h behind expected progress`;
        }
    },

    // Get color and status class based on progress
    getProgressColor(difference, proRatedTarget) {
        if (difference > 0) {
            // Ahead of target
            return { color: '#34C759', className: 'ahead' };
        } else if (difference >= 0) {
            // Exactly on target
            return { color: '#34C759', className: 'on-track' };
        } else {
            // Behind target
            const underPercentage = Math.abs(difference / proRatedTarget) * 100;
            
            if (underPercentage <= 15) {
                return { color: '#FF9500', className: 'behind' };
            } else {
                return { color: '#FF3B30', className: 'significantly-behind' };
            }
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.EverTrackUtils = EverTrackUtils;
}