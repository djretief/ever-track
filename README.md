# EverTrack - Cross-Browser Extension for Everhour Time Tracking

A professional cross-browser extension for Safari, Firefox, and Chrome that provides visual progress tracking for your Everhour time against daily, weekly, and monthly targets.

## Features

- **Smart Progress Tracking**: Pro-rated targets based on your actual work schedule, not calendar time
- **Flexible Work Schedule**: Configure different work hours for each day
- **Multiple Time Periods**: Track daily, weekly, and monthly progress
- **Intelligent Color Coding**: Visual feedback based on progress (green=ahead, orange=behind, red=significantly behind)
- **Configurable Targets**: Customizable daily, weekly, and monthly hour targets
- **Secure API Integration**: Safe storage of your Everhour API token
- **Clean Interface**: Simple popup that doesn't interfere with browsing
- **Cross-Browser Support**: Works on Safari (macOS), Firefox (all OS), and Chrome (all OS)
- **Professional Development Setup**: TypeScript, ESLint, automated builds

### Smart Progress Calculation

EverTrack calculates progress based on your actual work schedule, not calendar time. For example, if your weekly target is 40 hours working Mon-Fri 9-5, on Wednesday at 2pm you should have completed ~50% of your target (20 hours).

## Project Structure

```
EverTrack/
├── src/                     # TypeScript/JavaScript source code
│   ├── background.ts        # Background service worker
│   ├── popup.ts            # Popup interface logic
│   ├── content.ts          # Content script injection
│   ├── settings.ts         # Settings page logic
│   ├── api.ts              # Everhour API integration
│   ├── time-utils.ts       # Time calculation utilities
│   ├── dom-utils.ts        # DOM manipulation helpers
│   └── browser-compat.ts   # Cross-browser compatibility layer
├── public/                  # Static assets
│   ├── popup.html          # Extension popup interface
│   ├── settings.html       # Settings page
│   └── css/                # Stylesheets
├── manifests/              # Browser-specific manifests
│   ├── safari.json         # Safari Web Extension manifest
│   ├── firefox.json        # Firefox WebExtension manifest
│   └── chrome.json         # Chrome Extension manifest
├── scripts/                # Build and utility scripts
│   ├── build-safari-extension.sh
│   ├── build-firefox-extension.sh
│   ├── build-chrome-extension.sh
│   ├── bump-version.sh
│   └── setup-dev-env.sh
├── types/                  # TypeScript type definitions
│   └── global.d.ts         # Browser extension types
├── icons/                  # Extension icons
├── dist/                   # Compiled TypeScript output
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration
└── Makefile              # Build automation
```

## Development Setup

### Prerequisites
- **macOS** (for Safari development)
- **Xcode Command Line Tools** (for Safari)
- **Node.js 16+** and **npm** (for TypeScript and linting)
- **Homebrew** (recommended for dependencies)

### Quick Setup
```bash
# Run the automated setup script
./scripts/setup-dev-env.sh
```

### Manual Setup
```bash
# Install Node.js (if not already installed)
brew install node

# Install dependencies
npm install

# Build TypeScript
npm run build:ts

# Run quality checks
npm run test
```

## Building Extensions

### All Browsers
```bash
# Build for all browsers
make all
# or
npm run build

# Clean all builds
make clean
```

### Individual Browsers
```bash
# Safari
make safari
# or
npm run build:safari

# Firefox  
make firefox
# or
npm run build:firefox

# Chrome
make chrome
# or
npm run build:chrome
```

### Development Commands
```bash
# TypeScript development
npm run watch          # Watch TypeScript files for changes
npm run type-check     # Type check without building
npm run lint           # Run ESLint and fix issues
npm run lint:check     # Check code quality

# Quick development builds
npm run dev:safari     # Build and open Safari extension in Xcode
npm run dev:firefox    # Build and install in Firefox
npm run dev:chrome     # Build and open Chrome for loading
```

## Installation

### Prerequisites
- Everhour account with API access
- **For Safari**: macOS with Safari browser + Xcode
- **For Firefox**: Firefox browser (any OS)  
- **For Chrome**: Chrome browser (any OS)

### Get Your Everhour API Token
1. Log in to [Everhour](https://app.everhour.com/#/account/profile)
2. Go to Account Settings → Profile
3. Copy your API token

## Safari Installation

1. **Enable Safari Development Features**:
   - Safari > Settings > Advanced → Check "Show Develop menu"
   - Safari > Settings > Developer → Check "Allow unsigned extensions"
   - This setting resets when Safari quits

2. **Build the Extension**:
   ```bash
   # Quick development build
   npm run dev:safari
   
   # Or manual build
   make safari
   ```

3. **Run in Xcode**:
   - Select "EverTrack (macOS)" scheme
   - Click Build and Run (⌘+R)
   - Keep the app running (extension only works while app is active)

## Firefox Installation

### Method 1: Using npm (Recommended)
```bash
# Build and install Firefox extension
npm run dev:firefox

# Or just build
npm run build:firefox
```

### Method 2: Using Make
```bash
# Build Firefox extension
make firefox

# Build and install in Firefox
make firefox-install
```

### Method 3: Manual Build
```bash
# Build Firefox extension (.xpi package)
./scripts/build-firefox-extension.sh

# Build and automatically open in Firefox  
./scripts/build-firefox-extension.sh --install
```

### Installation in Firefox
1. **Production install**: Go to `about:addons` → Settings → "Install Add-on From File" → Select the `.xpi` file
2. **Development install**: Go to `about:debugging` → "This Firefox" → "Load Temporary Add-on" → Select `manifest.json`

📦 **Extension Package**: Located at `../EverTrack-Firefox/EverTrack-v2.0.1.xpi`

## Chrome Installation

### Method 1: Using npm (Recommended)
```bash
# Build and load Chrome extension
npm run dev:chrome

# Or just build
npm run build:chrome
```

### Method 2: Using Make
```bash
# Build Chrome extension
make chrome

# Build and open Chrome for loading
make chrome-load
```

### Method 3: Manual Build
```bash
# Build Chrome extension (.zip package)
./scripts/build-chrome-extension.sh

# Build and open Chrome extensions page
./scripts/build-chrome-extension.sh --load
```

### Installation in Chrome
1. **Build the extension** (using any method above)
2. **Install in Chrome**:
   - **Production**: Upload the `.zip` file to Chrome Web Store Developer Dashboard
   - **Development**: Go to `chrome://extensions/` → Enable "Developer mode" → "Load unpacked" → Select the `clean-extension` directory

📦 **Extension Package**: Located at `../EverTrack-Chrome/EverTrack-Chrome-v2.0.1.zip`

## Version Management

```bash
# Bump version (updates all manifests and package.json)
npm run bump VERSION=2.1.0
# or
./scripts/bump-version.sh 2.1.0

# Create release build
npm run release
# or  
make release
```

4. **Enable in Safari**:
   - Safari > Settings > Extensions
   - Check "EverTrack" to enable
   - Click the EverTrack icon in the toolbar to configure

## Usage

1. **Configure Settings**:
   - Click the EverTrack icon in Safari's toolbar
   - Enter your Everhour API token
   - Set target hours (defaults: 8 daily, 40 weekly, 160 monthly)
   - Configure work schedule for each day
   - Test API connection and save

2. **View Progress**:
   - Click the EverTrack icon to see progress bars
   - Switch between Daily/Weekly/Monthly views
   - Color coding: Green (ahead), Orange (behind), Red (significantly behind)

3. **Work Schedule Configuration**:
   - Enable/disable days
   - Set different hours per day (e.g., Mon 9-5, Tue 10-6, Wed 8-4)
   - Supports flexible and part-time schedules

## Build Commands

| Command | Description |
|---------|-------------|
| `./build.sh dev` | Quick development build + open Xcode |
| `./build.sh release` | Full release build + open Xcode |
| `./build.sh build` | Build extension package only |
| `./build.sh clean` | Remove all build artifacts |
| `make dev` | Alternative development build |
| `./build-safari-extension.sh --open --build` | Direct script with options |

## Troubleshooting

### Common Issues

**Extension not appearing in Safari:**
- Ensure macOS app is running from Xcode
- Check "Allow unsigned extensions" is enabled
- Re-enable after Safari restarts (setting resets)

**Build errors:**
- Install Xcode from App Store (not just command line tools)
- Update command line tools: `xcode-select --install`
- Set Xcode path: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- Fix permissions: `chmod +x build*.sh`

**API connection issues:**
- Verify API token in settings
- Test connection using built-in test button
- Check internet connectivity
- Ensure Everhour account has API access

**Data not updating:**
- Close and reopen popup (fetches fresh data)
- Verify time entries exist in Everhour
- Check selected date range

### Build Script Fixes

Missing icons or bundle errors are automatically resolved by running:
```bash
./build.sh clean
./build.sh dev
```

## Development

### Requirements
- macOS with Xcode and command line tools
- Safari for testing

### Project Structure
```
├── manifest.json          # Extension configuration
├── popup.html/js          # Main interface
├── settings.html/js       # Settings page
├── background.js          # Background script
├── icons/                 # Extension icons
├── build*.sh             # Build scripts
└── README.md             # Documentation
```

### Development Workflow
1. Make changes to extension files
2. Run `./build.sh dev` to rebuild
3. Test in Safari (app must stay running)
4. For minor changes, rebuild in Xcode (⌘+B)

### Technical Details
- **Type**: Safari Web Extension (packaged as macOS App Extension)
- **Platform**: macOS only
- **APIs**: Everhour REST API (`/users/me`, `/time`)
- **Storage**: Safari's secure extension storage
- **Refresh**: On-demand when popup opens

## Documentation

For detailed technical information and contributor guidance:

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture, data flow, and component relationships
- **[Contributor Guide](docs/CONTRIBUTOR_GUIDE.md)** - Complete onboarding guide for new contributors with step-by-step setup
- **[Component Diagrams](docs/COMPONENT_DIAGRAMS.md)** - Visual flowcharts and interaction diagrams
- **[Changelog](CHANGELOG.md)** - Version history and feature updates

### Quick Links
- **Understanding the codebase?** → Start with [Architecture Guide](docs/ARCHITECTURE.md)
- **Want to contribute?** → Follow [Contributor Guide](docs/CONTRIBUTOR_GUIDE.md)
- **Need visual overview?** → Check [Component Diagrams](docs/COMPONENT_DIAGRAMS.md)
- **Looking for specific changes?** → Browse [Changelog](CHANGELOG.md)

## Support

If you find this helpful, consider supporting:

<a href="https://www.buymeacoffee.com/djretiefr"><img src="https://img.buymeacoffee.com/button-api/?slug=djretiefr&font_family=Inter&button_colour=FFDD00"></a>
