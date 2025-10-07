# EverTrack - Browser Extension for Everhour Time Tracking

A cross-browser extension for Safari and Firefox that provides visual progress tracking for your Everhour time against daily, weekly, and monthly targets.

## Features

- 📊 **Smart Progress Tracking**: Pro-rated targets based on your actual work schedule, not calendar time
- 🕐 **Flexible Work Schedule**: Configure different work hours for each day
- 🎯 **Multiple Time Periods**: Track daily, weekly, and monthly progress
- 🟢 **Intelligent Color Coding**: Visual feedback based on progress (green=ahead, orange=behind, red=significantly behind)
- ⚙️ **Configurable Targets**: Customizable daily, weekly, and monthly hour targets
- 🔐 **Secure API Integration**: Safe storage of your Everhour API token
- 📱 **Clean Interface**: Simple popup that doesn't interfere with browsing
- 🦊 **Cross-Browser Support**: Works on both Safari (macOS) and Firefox

### Smart Progress Calculation

EverTrack calculates progress based on your actual work schedule, not calendar time. For example, if your weekly target is 40 hours working Mon-Fri 9-5, on Wednesday at 2pm you should have completed ~50% of your target (20 hours).

## Installation

### Prerequisites
- Everhour account with API access
- **For Safari**: macOS with Safari browser + Xcode
- **For Firefox**: Firefox browser (any OS)

### Get Your Everhour API Token
1. Log in to [Everhour](https://app.everhour.com/#/account/profile)
2. Go to Account Settings → Profile
3. Copy your API token

## Safari Installation

1. **Enable Safari Development Features**:
   - Safari > Settings > Advanced → Check "Show Develop menu"
   - Safari > Settings > Developer → Check "Allow unsigned extensions"
   - ⚠️ This setting resets when Safari quits

2. **Build the Extension**:
   ```bash
   # Quick development build
   ./build.sh dev
   
   # Or full release build
   ./build.sh release
   
   # Using Makefile
   make build
   ```

3. **Run in Xcode**:
   - Select "EverTrack (macOS)" scheme
   - Click Build and Run (⌘+R)
   - Keep the app running (extension only works while app is active)

## Firefox Installation

### Method 1: Using Make (Recommended)
```bash
# Build Firefox extension
make firefox

# Build and install in Firefox
make firefox-install
```

### Method 2: Manual Build
```bash
# Build Firefox extension (.xpi package)
./build-firefox-extension.sh

# Build and automatically open in Firefox
./build-firefox-extension.sh --install
```

### Method 3: Development Install
1. **Build the extension**:
   ```bash
   ./build-firefox-extension.sh
   ```

2. **Install in Firefox**:
   - **Production install**: Go to `about:addons` → ⚙️ → "Install Add-on From File" → Select the `.xpi` file
   - **Development install**: Go to `about:debugging` → "This Firefox" → "Load Temporary Add-on" → Select `manifest.json`

📦 **Extension Package**: Located at `~/Development/EverTrack-Firefox/EverTrack-v2.0.0.xpi`

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
   - Color coding: 🟢 Green (ahead), 🟠 Orange (behind), 🔴 Red (significantly behind)

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

## Support

If you find this helpful, consider supporting:

<a href="https://www.buymeacoffee.com/djretiefr"><img src="https://img.buymeacoffee.com/button-api/?slug=djretiefr&font_family=Inter&button_colour=FFDD00"></a>
