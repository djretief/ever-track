# EverTrack - Everhour Time Tracking Safari Extension

A Safari browser extension that helps you track your Everhour time against daily, weekly, and monthly targets with a visual progress bar.

## Features

- 📊 **Smart Progress Tracking**: Shows progress against pro-rated targets based on elapsed work hours, not calendar time
- 🕐 **Flexible Work Schedule**: Configure different work hours for each day of the week
- 🎯 **Multiple Time Periods**: Track daily, weekly, and monthly progress
- 🟢 **Intelligent Color-coding**: Green when on track, red when behind, orange when ahead
- ⚙️ **Configurable Targets**: Set your own daily, weekly, and monthly hour targets
- 🔐 **Secure API Integration**: Safely store your Everhour API token
- 📱 **Clean Interface**: Simple popup design that doesn't interfere with browsing

### Smart Progress Calculation

Unlike simple time trackers that use calendar time, EverTrack calculates progress based on your actual work schedule:

- **Pro-rated Targets**: If you're 50% through your work week, your target becomes 50% of your weekly goal
- **Work Hour Awareness**: Only counts elapsed time during your configured work hours
- **Flexible Scheduling**: Set different hours for each day (e.g., 9-5 Mon-Wed, 7-3 Thu, 10-2 Fri)
- **Real-time Updates**: Progress updates throughout the day as you work

**Example**: If your weekly target is 40 hours and you work Mon-Fri 9-5, on Wednesday at 2pm you should have completed ~50% of your target (20 hours), not just 20/40 based on calendar progress.

## Installation

### Prerequisites
- Safari browser (macOS)
- Everhour account with API access
- Your Everhour API token

### Getting Your Everhour API Token
1. Log in to your Everhour account
2. Go to [Account Settings](https://app.everhour.com/#/account/profile)
3. Find your API token in the profile section
4. Copy the token for use in the extension

### Installing the Extension

**Note**: This is a development extension. For production use, it would need to be submitted to the App Store.

#### Step 1: Configure Safari for Development

1. **Enable the Safari Develop Menu**:
   - Open Safari
   - Go to Safari > Settings > Advanced
   - Check "Show Develop menu in menu bar" (or "Show features for web developers" in Safari 17+)

2. **Allow Unsigned Extensions**:
   - **Safari 16 and earlier**: Go to Develop > Allow Unsigned Extensions
   - **Safari 17 and later**: Go to Safari > Settings > Developer tab > Check "Allow unsigned extensions"
   - ⚠️ **Important**: This setting resets when you quit Safari, so you'll need to re-enable it each time

#### Step 2: Build the Extension

This project includes automated build scripts to make the development process easier.

1. **Quick Development Build**:
   ```bash
   ./build.sh dev
   ```
   This will package the extension and open the Xcode project automatically.

2. **Full Release Build**:
   ```bash
   ./build.sh release
   ```
   This builds everything and opens Xcode for final testing.

3. **Manual Build** (if you prefer more control):
   ```bash
   ./build-safari-extension.sh --open --build
   ```

#### Available Build Commands

**Using the wrapper script (recommended):**
- `./build.sh dev` - Quick development build with Xcode opened
- `./build.sh build` - Build extension package and Xcode project
- `./build.sh release` - Full release build (build + open Xcode)
- `./build.sh clean` - Remove all build artifacts
- `./build.sh help` - Show available commands

**Using Makefile (alternative):**
- `make dev` - Quick development build
- `make build` - Build extension package
- `make release` - Full release build
- `make clean` - Clean build artifacts
- `make test` - Run validation tests
- `make install` - Build and open Xcode project

**Using the main script directly:**
- `./build-safari-extension.sh --open` - Package and open in Xcode
- `./build-safari-extension.sh --build` - Package and build in Xcode
- `./build-safari-extension.sh --open --build` - Full build process

#### Step 3: Run the macOS App

1. **After building**, Xcode will open automatically (if using `--open` flag)
2. **Select the scheme**: Choose "EverTrack (macOS)" from the scheme selector
   - Click the "Build and Run" button (▶️) or press Cmd+R
   - This will build the extension, embed it in a macOS app, and launch the app
   - **Keep the app running** - the extension only works while the app is running

#### Step 3: Enable the Extension in Safari

1. **Open Safari Settings**:
   - Go to Safari > Settings > Extensions tab
   - You should see "EverTrack" listed on the left side

2. **Enable the Extension**:
   - Check the box next to "EverTrack" to enable it
   - You should see the EverTrack icon appear in Safari's toolbar

3. **If the Extension Doesn't Appear**:
   - Make sure the macOS app is still running
   - Verify "Allow unsigned extensions" is enabled (Step 1.2)
   - Try restarting Safari and re-enabling unsigned extensions

3. **Configure the Extension**:
   - Click the EverTrack icon in the Safari toolbar
   - Click "Settings" in the popup
   - Enter your Everhour API token
   - Set your target hours (defaults: 8 daily, 40 weekly, 160 monthly)
   - Click "Test API Connection" to verify your token
   - Save your settings

## Usage

1. **Configure the Extension**:
   - Click the EverTrack icon in Safari's toolbar
   - Click "Settings" in the popup
   - Enter your Everhour API token: `69a0-9d8c-3e61e5-7b3a19-b7f3e424`
   - Set your target hours (defaults: 8 daily, 40 weekly, 160 monthly)
   - Click "Test API Connection" to verify your token works
   - Save your settings

2. **View Your Progress**:
   - Click the EverTrack icon in Safari's toolbar to see your progress
   - Use the Daily/Weekly/Monthly buttons to switch between time periods
   - The progress bar shows your current status:
     - **🟢 Green**: On track (90-110% of target)
     - **🔴 Red**: Behind target (shows hours needed to catch up)
     - **🟠 Orange**: Ahead of target (shows excess hours)

3. **Keep the App Running**:
   - ⚠️ **Important**: The Safari extension only works while the macOS app is running
   - You can minimize the app, but don't quit it
   - If you quit the app, you'll need to restart it from Xcode

## Troubleshooting

### Extension Not Appearing in Safari
- Ensure the macOS app (launched from Xcode) is still running
- Check that "Allow unsigned extensions" is enabled in Safari settings
- This setting resets when Safari is quit - re-enable it after restarting Safari
- Try refreshing the Extensions tab in Safari settings

### Build Errors in Xcode
- **Missing Icon.png error**: Icon files have been created automatically during packaging
- If you get icon-related build errors, ensure all icon files exist in:
  - `/EverTrack Extension/Resources/icons/` (icon-16.png, icon-32.png, icon-48.png, icon-128.png)
  - `/EverTrack/Resources/` (Icon.png)
- **Bundle identifier error**: Fixed - extension bundle ID is now properly prefixed with main app ID
- Clean and rebuild the project (Product > Clean Build Folder, then Product > Build)

### API Connection Issues
- Verify your API token is correct in the extension settings
- Test the API connection using the "Test API Connection" button
- Check your internet connection
- Ensure your Everhour account has API access enabled

### Data Not Loading or Updating
- The extension fetches fresh data each time you open the popup
- If data seems stale, close and reopen the popup
- Check that you have time entries in Everhour for the selected period
- Verify the date range matches your expectations

## Development

### Build Process

This project includes automated build scripts that handle the entire Safari extension packaging process using Apple's `safari-web-extension-packager` tool.

#### Build Requirements

- **Xcode** (with command line tools installed)
- **macOS** (Safari extensions require Xcode and can only be built on macOS)
- **Safari** for testing

#### Build Scripts

1. **`build-safari-extension.sh`** - Main build script with full configuration options:
   ```bash
   ./build-safari-extension.sh [OPTIONS]
   
   Options:
     --open    Open the generated Xcode project after packaging
     --build   Build the Xcode project after packaging  
     --help    Show help message
   ```

2. **`build.sh`** - Convenient wrapper script for common tasks:
   ```bash
   ./build.sh [COMMAND]
   
   Commands:
     dev        Build and open in Xcode for development
     build      Build the extension package and Xcode project
     release    Build everything and open in Xcode
     clean      Remove all build artifacts
     help       Show available commands
   ```

#### What the Build Process Does

1. **Validates** your extension files (manifest.json, required scripts, etc.)
2. **Packages** the web extension using `xcrun safari-web-extension-packager`
3. **Generates** a native macOS app with embedded Safari extension
4. **Creates** an Xcode project at `/Users/danielretief/Development/EverTrack-Safari/`
5. **Configures** proper bundle identifiers and app metadata
6. **Optionally builds** the Xcode project for immediate testing

#### Build Output

After running the build script, you'll find:
- **Xcode Project**: `EverTrack-Safari/EverTrack/EverTrack.xcodeproj`
- **macOS App**: Built app bundle with embedded Safari extension
- **Extension Resources**: Copied web extension files in the project structure

### Development Workflow

1. **Initial Setup**:
   ```bash
   ./build.sh dev
   ```

2. **Make Changes** to your web extension files (popup.js, background.js, etc.)

3. **Rebuild and Test**:
   ```bash
   ./build.sh build  # Or just rebuild in Xcode (Cmd+B)
   ```

4. **Clean Build** (if needed):
   ```bash
   ./build.sh clean
   ./build.sh dev
   ```

### Development Workflow
- To update the extension after making changes to the code:
  - In Xcode, choose Product > Build (Cmd+B)
  - The extension updates automatically once the build completes
- To restart completely:
  - Quit the macOS app
  - Run it again from Xcode (Cmd+R)

## Settings

Access the settings page by clicking "Settings" in the popup or through Safari's extension preferences.

### Configuration Options

- **Everhour API Token**: Your personal API token from Everhour
- **Daily Target**: Hours you aim to work per day (default: 8)
- **Weekly Target**: Hours you aim to work per week (default: 40)
- **Monthly Target**: Hours you aim to work per month (default: 160)
- **Work Schedule**: Configure work hours for each day of the week
  - Enable/disable each day
  - Set start and end times for each work day
  - Flexible scheduling (e.g., Mon 9-5, Tue 9-5, Wed 8-5, Thu 7-3, Fri 10-2)

### Work Schedule Examples

**Standard 9-5**: Monday-Friday, 9:00 AM - 5:00 PM
**Flexible Hours**: Different start/end times each day
**Part-time**: Only certain days enabled
**Compressed Week**: Longer days, fewer working days

## Privacy & Security

- Your API token is stored securely in Safari's extension storage
- No data is sent to third parties
- All communication is directly between the extension and Everhour's API
- Your time data is not stored locally beyond the current session

## Troubleshooting

### Build Issues

#### "safari-web-extension-packager not found" Error
If you see this error when running the build script:
```
[ERROR] safari-web-extension-packager not found. Make sure you have Xcode installed.
```

**Solutions:**
1. **Install Xcode** (not just command line tools):
   ```bash
   # Install from App Store or download from Apple Developer
   ```

2. **Update Xcode command line tools**:
   ```bash
   xcode-select --install
   ```

3. **Set correct Xcode path**:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

4. **Verify the tool is available**:
   ```bash
   xcrun --find safari-web-extension-packager
   ```

#### Build Script Permission Issues
If you get permission errors:
```bash
chmod +x build-safari-extension.sh
chmod +x build.sh
```

#### Missing Icon.png Error in Xcode
If you see this build error in Xcode:
```
Build input file cannot be found: '.../Shared (App)/Resources/Icon.png'
```

**This is automatically fixed by the build script now**, but if you encounter it:

1. **Automatic fix** (recommended):
   ```bash
   ./build.sh clean
   ./build.sh dev  # Will create missing icons and fix the issue
   ```

2. **Manual fix**:
   ```bash
   make icons      # Generate icon files
   ./build.sh dev  # Rebuild with icons
   ```

3. **The build script now automatically**:
   - Creates placeholder icons if missing
   - Copies `Icon.png` to the correct Xcode project location
   - Ensures all required icon sizes are available

### Extension Not Loading
- Ensure "Allow Unsigned Extensions" is enabled in Safari's Develop menu
- Check that the extension is enabled in Safari > Preferences > Extensions

### API Connection Issues
- Verify your API token is correct
- Check your internet connection
- Ensure your Everhour account has API access enabled

### Data Not Updating
- The extension fetches fresh data each time you open the popup
- If data seems stale, try closing and reopening the popup
- Check that you have time entries in Everhour for the selected period

## Support

For issues or feature requests, please check your:
1. Safari version compatibility
2. Everhour API token validity
3. Network connectivity

## Technical Details

- **Extension Type**: Safari Web Extension (packaged as macOS App Extension)
- **Platform**: macOS only
- **Requirements**: macOS with Safari, Xcode for development
- **Architecture**: 
  - Web extension files (HTML/CSS/JavaScript)
  - Packaged within a macOS app container
  - Runs only while the host macOS app is active
- **Permissions**: Everhour API access and storage
- **API Endpoints Used**: 
  - `/users/me` for authentication testing
  - `/time` for time entry data
- **Data Refresh**: On-demand when popup is opened
- **Storage**: Safari's extension storage (secure and sandboxed)

## Development

This extension is built using:
- HTML/CSS/JavaScript for the web extension
- Safari Extension APIs
- Everhour REST API
- Safari's storage APIs
- Xcode for packaging and distribution

### Project Structure:
```
EverTrack/                          # Original web extension
├── manifest.json                   # Extension configuration
├── popup.html / popup.js          # Main popup interface
├── settings.html / settings.js    # Settings page
├── background.js                   # Background script
├── icons/                          # Extension icons
└── README.md                       # Documentation

EverTrack-Safari/EverTrack/         # Packaged Safari extension
├── EverTrack.xcodeproj            # Xcode project
├── EverTrack/                     # macOS app container
└── EverTrack Extension/           # Web extension files (copied)
```

### Development Workflow:
1. Make changes to files in `/Users/danielretief/EverTrack/`
2. Re-run the safari-web-extension-packager to update the Xcode project
3. Build and run from Xcode to test changes
4. For minor changes, you can edit files directly in the `EverTrack Extension/` folder and rebuild