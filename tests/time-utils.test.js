/**
 * Unit tests for EverTrackTime utilities - Clean version
 */

// Clear any existing EverTrackTime to ensure fresh module initialization
delete global.window.EverTrackTime;

// Load the time-utils.js file
const EverTrackTime = require('../src/time-utils.js');

describe('EverTrackTime Module Loading', () => {
  test('should load module and export functions', () => {
    expect(EverTrackTime).toBeDefined();
    expect(typeof EverTrackTime).toBe('object');
    expect(typeof EverTrackTime.formatHours).toBe('function');
    expect(typeof EverTrackTime.getStatus).toBe('function');
    expect(typeof EverTrackTime.parseTime).toBe('function');
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
  });

  test('should format positive hours with minutes', () => {
    expect(EverTrackTime.formatHours(8, true)).toBe('8h');
    expect(EverTrackTime.formatHours(7.5, true)).toBe('7h 30m');
    expect(EverTrackTime.formatHours(0.25, true)).toBe('15m'); // 0.25h = 15 minutes exactly
    expect(EverTrackTime.formatHours(8.75, true)).toBe('8h 45m'); // 8.75h = 8h 45m exactly
    expect(EverTrackTime.formatHours(1.25, true)).toBe('1h 15m'); // 1.25h = 1h 15m exactly
  });
});