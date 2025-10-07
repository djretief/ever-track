#!/bin/bash

# Chrome Extension Build Script for EverTrack
# This script packages the web extension for Chrome

set -e  # Exit on any error

# Configuration
EXTENSION_DIR="$(pwd)"
OUTPUT_DIR="$HOME/Development/EverTrack-Chrome"
EXTENSION_NAME="EverTrack"
VERSION="2.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are available
check_requirements() {
    print_status "Checking requirements..."
    
    # Check if zip is available (should be on all Unix systems)
    if ! command -v zip &> /dev/null; then
        print_error "zip command not found. Please install zip utility."
        exit 1
    fi
    
    print_success "All requirements met"
}

# Function to validate extension files
validate_files() {
    print_status "Validating extension files..."
    
    # Check if required files exist
    required_files=("background.js" "popup.html" "settings.html")
    for file in "${required_files[@]}"; do
        if [ ! -f "$EXTENSION_DIR/$file" ]; then
            print_error "Required file $file not found"
            exit 1
        fi
    done
    
    # Check if modular JS files exist
    required_js_files=("js/api.js" "js/settings.js" "js/time-utils.js" "js/dom-utils.js" "js/popup.js" "js/content.js")
    for file in "${required_js_files[@]}"; do
        if [ ! -f "$EXTENSION_DIR/$file" ]; then
            print_error "Required modular JS file $file not found"
            exit 1
        fi
    done
    
    # Check if CSS files exist
    required_css_files=("css/popup.css" "css/settings.css" "css/content.css")
    for file in "${required_css_files[@]}"; do
        if [ ! -f "$EXTENSION_DIR/$file" ]; then
            print_error "Required CSS file $file not found"
            exit 1
        fi
    done
    
    # Check if icons directory exists
    if [ ! -d "$EXTENSION_DIR/icons" ]; then
        print_warning "Icons directory not found. The extension will work but may not have proper icons."
    fi
    
    print_success "Extension files validated"
}

# Function to prepare resources
prepare_resources() {
    print_status "Preparing extension resources..."
    
    # Create icons if they don't exist
    if [ ! -f "$EXTENSION_DIR/icons/icon-16.png" ] || [ ! -f "$EXTENSION_DIR/icons/Icon.png" ]; then
        print_status "Creating missing icon files..."
        
        # Check if Python environment exists and create icons
        if [ -f "$EXTENSION_DIR/.venv/bin/python" ]; then
            "$EXTENSION_DIR/.venv/bin/python" "$EXTENSION_DIR/create-icons.py"
        elif command -v python3 &> /dev/null; then
            python3 "$EXTENSION_DIR/create-icons.py"
        else
            print_warning "Python not found. Icons may be missing..."
        fi
    fi
    
    print_success "Extension resources prepared"
}

# Function to create clean extension directory for Chrome
create_clean_chrome_extension() {
    print_status "Creating clean Chrome extension directory..."
    
    # Create clean directory
    CLEAN_EXTENSION_DIR="$OUTPUT_DIR/clean-extension"
    rm -rf "$CLEAN_EXTENSION_DIR"
    mkdir -p "$CLEAN_EXTENSION_DIR"
    
    # Copy Chrome manifest
    if [ -f "$EXTENSION_DIR/manifest-chrome.json" ]; then
        cp "$EXTENSION_DIR/manifest-chrome.json" "$CLEAN_EXTENSION_DIR/manifest.json"
    else
        print_error "Chrome manifest (manifest-chrome.json) not found"
        exit 1
    fi
    
    # Copy core extension files
    cp "$EXTENSION_DIR/background.js" "$CLEAN_EXTENSION_DIR/"
    cp "$EXTENSION_DIR/popup.html" "$CLEAN_EXTENSION_DIR/"
    cp "$EXTENSION_DIR/settings.html" "$CLEAN_EXTENSION_DIR/"
    
    # Copy JS directory
    cp -r "$EXTENSION_DIR/js" "$CLEAN_EXTENSION_DIR/"
    
    # Copy CSS directory  
    cp -r "$EXTENSION_DIR/css" "$CLEAN_EXTENSION_DIR/"
    
    # Copy icons directory
    if [ -d "$EXTENSION_DIR/icons" ]; then
        cp -r "$EXTENSION_DIR/icons" "$CLEAN_EXTENSION_DIR/"
    fi
    
    print_success "Clean Chrome extension directory created"
}

# Function to create Chrome extension package
create_chrome_package() {
    print_status "Creating Chrome extension package..."
    
    # Remove existing output directory if it exists
    if [ -d "$OUTPUT_DIR" ]; then
        print_status "Removing existing output directory..."
        rm -rf "$OUTPUT_DIR"
    fi
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Create clean extension directory
    create_clean_chrome_extension
    
    # Create the .zip package for Chrome Web Store
    print_status "Creating .zip package for Chrome Web Store..."
    cd "$CLEAN_EXTENSION_DIR"
    
    local zip_filename="${EXTENSION_NAME}-Chrome-v${VERSION}.zip"
    local zip_path="$OUTPUT_DIR/$zip_filename"
    
    # Create zip file
    zip -r "$zip_path" . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"
    
    if [ $? -eq 0 ]; then
        print_success "Chrome extension package created successfully"
        print_success "Package location: $zip_path"
        
        # Keep clean directory for development testing
        print_success "Development directory: $CLEAN_EXTENSION_DIR"
        
        return 0
    else
        print_error "Failed to create Chrome extension package"
        rm -rf "$CLEAN_EXTENSION_DIR"
        exit 1
    fi
}

# Function to open Chrome for extension loading
open_chrome_extension() {
    print_status "Opening Chrome for extension loading..."
    
    if command -v google-chrome &> /dev/null; then
        google-chrome chrome://extensions/ &
        print_success "Opened Chrome Extensions page"
    elif command -v google-chrome-stable &> /dev/null; then
        google-chrome-stable chrome://extensions/ &
        print_success "Opened Chrome Extensions page"
    elif [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" --args --new-window chrome://extensions/
        print_success "Opened Chrome Extensions page"
    else
        print_warning "Chrome not found. Please manually go to chrome://extensions/"
    fi
    
    print_status "To load the extension:"
    print_status "1. Enable 'Developer mode' in the top right"
    print_status "2. Click 'Load unpacked'"
    print_status "3. Select: $CLEAN_EXTENSION_DIR"
}

# Main execution function
main() {
    echo "=========================================="
    echo "EverTrack Chrome Extension Builder"
    echo "=========================================="
    
    # Parse command line arguments
    OPEN_CHROME=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --load)
                OPEN_CHROME=true
                shift
                ;;
            --help)
                echo "Usage: $0 [--load] [--help]"
                echo "  --load    Open Chrome extensions page for loading the extension"
                echo "  --help    Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run build steps
    check_requirements
    validate_files
    prepare_resources
    create_chrome_package
    
    # Open Chrome if requested
    if [ "$OPEN_CHROME" = true ]; then
        open_chrome_extension
    fi
    
    echo "=========================================="
    echo "Chrome Extension Build Complete!"
    echo "=========================================="
    echo ""
    echo "Your Chrome extension has been packaged successfully."
    echo ""
    echo "📦 Distribution Package: $OUTPUT_DIR/${EXTENSION_NAME}-Chrome-v${VERSION}.zip"
    echo "🔧 Development Directory: $OUTPUT_DIR/clean-extension/"
    echo ""
    echo "Installation Options:"
    echo ""
    echo "🏪 Chrome Web Store (Production):"
    echo "   Upload the .zip file to Chrome Developer Dashboard"
    echo ""
    echo "🔧 Developer Mode (Testing):"
    echo "   1. Go to chrome://extensions/"
    echo "   2. Enable 'Developer mode'"
    echo "   3. Click 'Load unpacked'"
    echo "   4. Select the clean-extension directory"
    echo ""
    echo "🚀 Quick load: $0 --load"
    echo ""
    print_success "Build script completed successfully!"
}

# Run main function
main "$@"