#!/bin/bash

# Firefox Extension Build Script for EverTrack
# This script packages the web extension for Firefox

set -e  # Exit on any error

# Configuration
EXTENSION_DIR="$(pwd)"
OUTPUT_DIR="$(pwd)/../EverTrack-Firefox"
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

# Function to create clean extension directory for Firefox
create_clean_firefox_extension() {
    print_status "Creating clean Firefox extension directory..."
    
    # Create clean directory
    CLEAN_EXTENSION_DIR="$OUTPUT_DIR/clean-extension"
    rm -rf "$CLEAN_EXTENSION_DIR"
    mkdir -p "$CLEAN_EXTENSION_DIR"
    
    # Copy Firefox manifest
    if [ -f "$EXTENSION_DIR/manifest-firefox.json" ]; then
        cp "$EXTENSION_DIR/manifest-firefox.json" "$CLEAN_EXTENSION_DIR/manifest.json"
    else
        print_error "Firefox manifest (manifest-firefox.json) not found"
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
    
    print_success "Clean Firefox extension directory created"
}

# Function to create Firefox extension package
create_firefox_package() {
    print_status "Creating Firefox extension package..."
    
    # Remove existing output directory if it exists
    if [ -d "$OUTPUT_DIR" ]; then
        print_status "Removing existing output directory..."
        rm -rf "$OUTPUT_DIR"
    fi
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Create clean extension directory
    create_clean_firefox_extension
    
    # Create the .xpi package
    print_status "Creating .xpi package..."
    cd "$CLEAN_EXTENSION_DIR"
    
    local xpi_filename="${EXTENSION_NAME}-v${VERSION}.xpi"
    local xpi_path="$OUTPUT_DIR/$xpi_filename"
    
    # Create zip file with .xpi extension
    zip -r "$xpi_path" . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"
    
    if [ $? -eq 0 ]; then
        print_success "Firefox extension package created successfully"
        print_success "Package location: $xpi_path"
        
        # Clean up temporary directory
        rm -rf "$CLEAN_EXTENSION_DIR"
        
        return 0
    else
        print_error "Failed to create Firefox extension package"
        rm -rf "$CLEAN_EXTENSION_DIR"
        exit 1
    fi
}

# Function to install extension for testing
install_firefox_extension() {
    print_status "Opening Firefox for extension installation..."
    
    local xpi_filename="${EXTENSION_NAME}-v${VERSION}.xpi"
    local xpi_path="$OUTPUT_DIR/$xpi_filename"
    
    if [ -f "$xpi_path" ]; then
        # Try to open with Firefox
        if command -v firefox &> /dev/null; then
            firefox "$xpi_path" &
            print_success "Opened extension package in Firefox"
        elif [ -d "/Applications/Firefox.app" ]; then
            open -a "Firefox" "$xpi_path"
            print_success "Opened extension package in Firefox"
        else
            print_warning "Firefox not found. Please manually install: $xpi_path"
        fi
    else
        print_error "Extension package not found: $xpi_path"
        exit 1
    fi
}

# Main execution function
main() {
    echo "=========================================="
    echo "EverTrack Firefox Extension Builder"
    echo "=========================================="
    
    # Parse command line arguments
    INSTALL_EXTENSION=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                INSTALL_EXTENSION=true
                shift
                ;;
            --help)
                echo "Usage: $0 [--install] [--help]"
                echo "  --install    Open Firefox to install the extension after building"
                echo "  --help       Show this help message"
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
    create_firefox_package
    
    # Install if requested
    if [ "$INSTALL_EXTENSION" = true ]; then
        install_firefox_extension
    fi
    
    echo "=========================================="
    echo "Firefox Extension Build Complete!"
    echo "=========================================="
    echo ""
    echo "Your Firefox extension has been packaged successfully."
    echo ""
    echo "📦 Package Location: $OUTPUT_DIR/${EXTENSION_NAME}-v${VERSION}.xpi"
    echo ""
    echo "To install in Firefox:"
    echo "1. Open Firefox"
    echo "2. Go to about:addons"
    echo "3. Click the gear icon ⚙️"
    echo "4. Select 'Install Add-on From File...'"
    echo "5. Choose the .xpi file"
    echo ""
    echo "For development/testing:"
    echo "1. Open Firefox"
    echo "2. Go to about:debugging"
    echo "3. Click 'This Firefox'"
    echo "4. Click 'Load Temporary Add-on...'"
    echo "5. Select the manifest.json from: $OUTPUT_DIR/clean-extension/"
    echo ""
    print_success "Build script completed successfully!"
}

# Run main function
main "$@"