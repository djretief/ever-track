# Changelog

All notable changes to EverTrack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-11

### Added
- Initial beta release of EverTrack extension
- Cross-browser support (Safari, Firefox, Chrome)
- Smart work schedule configuration with per-day customization
- Pro-rated target calculations based on elapsed work time
- Content script injection into Everhour web app
- Color-coded progress feedback (green/orange/red system)
- Improved progress bar with center alignment
- Makefile build system for all browsers
- Browser compatibility layer for unified API access
- Manifest V3 support for Chrome
- Firefox .xpi packaging
- Chrome .zip packaging for Web Store

### Features
- Visual progress tracking against daily, weekly, and monthly targets
- Everhour API integration with official REST endpoints
- Settings configuration interface for API tokens and targets
- Extension popup interface with clean design
- Content script shows progress directly in Everhour web app
- Intelligent color coding based on progress status
- Flexible work hour configuration (different times per day)
- Pro-rated targets that account for actual work schedule

### Technical
- Safari Web Extension architecture
- Xcode project integration for macOS App Store distribution
- Automated build system with icon generation
- Comprehensive error handling and user feedback
- Cross-browser API compatibility layer
- Secure API token storage using browser extension APIs

### Known Issues
- Extension is in beta - limited testing across different configurations
- May require additional validation for edge cases
- Performance optimization opportunities exist
- Content script positioning may need fine-tuning on different screen sizes