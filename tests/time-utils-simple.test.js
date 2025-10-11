/**
 * Unit tests for EverTrackTime utilities - Simplified approach
 */

// Set up minimal browser environment before any requires
global.window = {};

// Load the time-utils.js file at the top level
const EverTrackTime = require('../src/time-utils.js');

describe('EverTrackTime Module Loading', () => {
  test('should load module correctly', () => {
    expect(EverTrackTime).toBeDefined();
    expect(typeof EverTrackTime).toBe('object');
    expect(typeof EverTrackTime.formatHours).toBe('function');
  });
});

describe('EverTrackTime.formatHours', () => {
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

describe('EverTrackTime.getStatus', () => {
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

describe('EverTrackTime.parseTime', () => {
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