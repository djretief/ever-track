// Jest global setup - runs BEFORE any modules are loaded
// This file sets up the global environment that browser extension modules expect

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set up window object BEFORE any modules load
global.window = {
  // Window should NOT have EverTrackTime initially
  // so the modules will initialize properly
  // Do NOT set EverTrackTime here - let the module do it
};

// Add other globals that might be needed
global.document = {
  createElement: jest.fn(() => ({
    style: {},
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    }
  })),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => [])
};

// Mock browser APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  browserAction: {
    onClicked: {
      addListener: jest.fn()
    },
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  }
};

global.browser = global.chrome;

// Mock fetch for API tests
global.fetch = jest.fn();

console.log('Jest globals initialized - window defined:', !!global.window);