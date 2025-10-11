/**
 * Unit tests for EverTrackTime utilities
 */

describe('EverTrackTime', () => {
  let EverTrackTime;

  beforeAll(() => {
    // Set up minimal browser environment for the module  
    global.window = {};
    
    // Load the time-utils.js file - it will export via module.exports 
    EverTrackTime = require('../src/time-utils.js');
    
    console.log('Loaded EverTrackTime in test:', !!EverTrackTime);
    console.log('Has formatHours:', typeof EverTrackTime?.formatHours);
  });
  
  describe('formatHours', () => {
    test('should format zero hours', () => {
      expect(EverTrackTime.formatHours(0)).toBe('0h');
      expect(EverTrackTime.formatHours(0, true)).toBe('0h');
    });

    test('should format positive hours without minutes', () => {
      expect(EverTrackTime.formatHours(8)).toBe('8h');
      expect(EverTrackTime.formatHours(7.5)).toBe('7.5h');
      expect(EverTrackTime.formatHours(0.25)).toBe('0.3h'); // Rounded to nearest 0.1
    });

    test('should format positive hours with minutes', () => {
      expect(EverTrackTime.formatHours(8, true)).toBe('8h');
      expect(EverTrackTime.formatHours(7.5, true)).toBe('7h 30m');
      expect(EverTrackTime.formatHours(0.25, true)).toBe('15m');
      expect(EverTrackTime.formatHours(8.75, true)).toBe('8h 45m');
    });

    test('should format negative hours', () => {
      expect(EverTrackTime.formatHours(-2)).toBe('-2h');
      expect(EverTrackTime.formatHours(-1.5)).toBe('-1.5h');
      expect(EverTrackTime.formatHours(-2.25, true)).toBe('-2h 15m');
    });

    test('should handle small numbers and rounding', () => {
      expect(EverTrackTime.formatHours(0.06)).toBe('0.1h'); // Rounds up from 0.06
      expect(EverTrackTime.formatHours(0.04)).toBe('0h'); // Rounds down from 0.04
    });
  });

  describe('getStatus', () => {
    test('should return no target message when target is zero', () => {
      expect(EverTrackTime.getStatus(0, 0)).toBe('No target set');
      expect(EverTrackTime.getStatus(5, 0)).toBe('No target set');
    });

    test('should return on target message for small differences', () => {
      expect(EverTrackTime.getStatus(0.05, 8)).toBe('Right on target! 🎯');
      expect(EverTrackTime.getStatus(-0.09, 8)).toBe('Right on target! 🎯');
    });

    test('should return over target message for positive differences', () => {
      expect(EverTrackTime.getStatus(1.5, 8)).toBe('1h 30m over target 📈');
      expect(EverTrackTime.getStatus(0.25, 8)).toBe('15m over target 📈');
    });

    test('should return behind target message for negative differences', () => {
      expect(EverTrackTime.getStatus(-1.5, 8)).toBe('1h 30m behind target 📉');
      expect(EverTrackTime.getStatus(-0.25, 8)).toBe('15m behind target 📉');
    });
  });

  describe('calculateProgress', () => {
    const mockWorkSchedule = {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    };

    test('should calculate basic progress metrics', () => {
      // Mock calculateExpectedHours to return 8 for simplicity
      const originalMethod = EverTrackTime.calculateExpectedHours;
      EverTrackTime.calculateExpectedHours = jest.fn().mockReturnValue(8);

      const result = EverTrackTime.calculateProgress(6, 8, 'daily', mockWorkSchedule);

      expect(result.workedHours).toBe(6);
      expect(result.targetHours).toBe(8);
      expect(result.expectedHours).toBe(8);
      expect(result.difference).toBe(-2);
      expect(result.progressPercentage).toBe(75);
      expect(result.isOverTarget).toBe(false);
      expect(result.className).toBe('under-target');
      expect(result.formattedWorked).toBe('6h');
      expect(result.formattedTarget).toBe('8h');
      expect(result.formattedDifference).toBe('-2h');

      // Restore original method
      EverTrackTime.calculateExpectedHours = originalMethod;
    });

    test('should handle over-target scenarios', () => {
      const originalMethod = EverTrackTime.calculateExpectedHours;
      EverTrackTime.calculateExpectedHours = jest.fn().mockReturnValue(8);

      const result = EverTrackTime.calculateProgress(10, 8, 'daily', mockWorkSchedule);

      expect(result.difference).toBe(2);
      expect(result.isOverTarget).toBe(true);
      expect(result.className).toBe('over-target');
      expect(result.progressPercentage).toBe(125);

      EverTrackTime.calculateExpectedHours = originalMethod;
    });

    test('should handle zero expected hours', () => {
      const originalMethod = EverTrackTime.calculateExpectedHours;
      EverTrackTime.calculateExpectedHours = jest.fn().mockReturnValue(0);

      const result = EverTrackTime.calculateProgress(4, 8, 'daily', mockWorkSchedule);

      expect(result.progressPercentage).toBe(0);
      expect(result.expectedHours).toBe(0);

      EverTrackTime.calculateExpectedHours = originalMethod;
    });
  });

  describe('calculateWorkingDays', () => {
    const mockWorkSchedule = {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    };

    test('should count working days correctly for a full week', () => {
      // Monday Oct 7, 2025 to Sunday Oct 13, 2025
      const startDate = new Date(2025, 9, 7); // Month is 0-indexed
      const endDate = new Date(2025, 9, 13);
      
      const workingDays = EverTrackTime.calculateWorkingDays(startDate, endDate, mockWorkSchedule);
      expect(workingDays).toBe(5); // Mon-Fri
    });

    test('should count working days for partial weeks', () => {
      // Wednesday Oct 9, 2025 to Friday Oct 11, 2025
      const startDate = new Date(2025, 9, 9);
      const endDate = new Date(2025, 9, 11);
      
      const workingDays = EverTrackTime.calculateWorkingDays(startDate, endDate, mockWorkSchedule);
      expect(workingDays).toBe(3); // Wed, Thu, Fri
    });

    test('should return zero for weekend-only period', () => {
      // Saturday Oct 12, 2025 to Sunday Oct 13, 2025
      const startDate = new Date(2025, 9, 12);
      const endDate = new Date(2025, 9, 13);
      
      const workingDays = EverTrackTime.calculateWorkingDays(startDate, endDate, mockWorkSchedule);
      expect(workingDays).toBe(0);
    });

    test('should handle custom work schedules', () => {
      const customSchedule = {
        ...mockWorkSchedule,
        saturday: { enabled: true, start: '10:00', end: '14:00' },
        wednesday: { enabled: false, start: '09:00', end: '17:00' }
      };

      // Monday Oct 7, 2025 to Sunday Oct 13, 2025
      const startDate = new Date(2025, 9, 7);
      const endDate = new Date(2025, 9, 13);
      
      const workingDays = EverTrackTime.calculateWorkingDays(startDate, endDate, customSchedule);
      expect(workingDays).toBe(5); // Mon, Tue, Thu, Fri, Sat (Wed disabled)
    });
  });

  describe('parseTime', () => {
    test('should parse time strings correctly', () => {
      const result1 = EverTrackTime.parseTime('09:30');
      expect(result1.getHours()).toBe(9);
      expect(result1.getMinutes()).toBe(30);

      const result2 = EverTrackTime.parseTime('17:45');
      expect(result2.getHours()).toBe(17);
      expect(result2.getMinutes()).toBe(45);

      const result3 = EverTrackTime.parseTime('00:00');
      expect(result3.getHours()).toBe(0);
      expect(result3.getMinutes()).toBe(0);
    });

    test('should handle edge cases', () => {
      const result = EverTrackTime.parseTime('23:59');
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });
  });

});