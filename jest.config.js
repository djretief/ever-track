module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/background*.js', // Skip background scripts that require browser APIs
    '!src/content.js'      // Skip content script that requires DOM injection
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  setupFiles: ['<rootDir>/tests/globals.js'], // Load globals before modules
  globals: {
    chrome: {},
    browser: {},
    EverTrackAPI: {},
    EverTrackSettings: {},
    EverTrackTime: {},
    EverTrackDOM: {}
  },
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/packages/'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};