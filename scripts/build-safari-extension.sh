#!/bin/bash

# Safari Extension Build Script for EverTrack
# This script packages the web extension for Safari using Apple's safari-web-extension-packager

set -e  # Exit on any error

# Configuration
EXTENSION_DIR="$(pwd)"
OUTPUT_DIR="$(pwd)/../EverTrack-Safari"
APP_NAME="EverTrack"
BUNDLE_ID="com.evertrack.EverTrack"

# Read version from version.json
read_version() {
    if [ -f "version.json" ]; then
        VERSION=$(grep '"version"' version.json | sed 's/.*: *"\([^"]*\)".*/\1/')
        APP_NAME_FROM_JSON=$(grep '"name"' version.json | sed 's/.*: *"\([^"]*\)".*/\1/')
        # Use the version from JSON but keep the hardcoded APP_NAME for Safari
    else
        VERSION="0.1.0"
        echo "[WARNING] version.json not found, using default version: $VERSION"
    fi
}

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
    
    # Check if Xcode command line tools are installed
    if ! command -v xcrun &> /dev/null; then
        print_error "Xcode command line tools not found. Please install them first:"
        echo "  xcode-select --install"
        exit 1
    fi
    
    # Check if safari-web-extension-packager is available
    if ! xcrun --find safari-web-extension-packager &> /dev/null; then
        print_error "safari-web-extension-packager not found. Make sure you have Xcode installed."
        exit 1
    fi
    
    print_success "All requirements met"
}

# Function to validate extension files
validate_extension() {
    print_status "Validating extension files..."
    
    # Check if Safari manifest exists
    if [ ! -f "$EXTENSION_DIR/manifests/safari.json" ]; then
        print_error "Safari manifest not found in $EXTENSION_DIR/manifests/safari.json"
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "$EXTENSION_DIR/public/popup.html" ]; then
        print_error "Required file public/popup.html not found"
        exit 1
    fi
    if [ ! -f "$EXTENSION_DIR/src/background.js" ]; then
        print_error "Required file src/background.js not found"
        exit 1
    fi
    if [ ! -f "$EXTENSION_DIR/public/settings.html" ]; then
        print_error "Required file public/settings.html not found"
        exit 1
    fi
    
    # Check if modular JS files exist
    required_js_files=("src/api.js" "src/settings.js" "src/time-utils.js" "src/dom-utils.js" "src/popup.js" "src/content.js")
    for file in "${required_js_files[@]}"; do
        if [ ! -f "$EXTENSION_DIR/$file" ]; then
            print_error "Required modular JS file $file not found"
            exit 1
        fi
    done
    
    # Check if CSS files exist
    required_css_files=("public/css/popup.css" "public/css/settings.css" "public/css/content.css")
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

# Function to create icons and prepare resources
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
            print_warning "Python not found. Creating simple placeholder icons..."
            # Create minimal placeholder icons using built-in tools
            create_placeholder_icons
        fi
    fi
    
    print_success "Extension resources prepared"
}

# Function to create placeholder icons using macOS built-in tools
create_placeholder_icons() {
    local icons_dir="$EXTENSION_DIR/icons"
    mkdir -p "$icons_dir"
    
    # Create a simple colored rectangle as placeholder using built-in tools
    for size in 16 32 48 128; do
        local icon_file="$icons_dir/icon-${size}.png"
        if [ ! -f "$icon_file" ]; then
            # Create a simple colored square using sips (macOS built-in)
            # First create a temporary file with ImageIO
            /usr/bin/sips -s format png -z $size $size "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns" --out "$icon_file" 2>/dev/null || {
                # Fallback: Create a minimal icon file
                print_warning "Creating minimal icon placeholder for ${size}x${size}"
                touch "$icon_file"
            }
        fi
    done
    
    # Copy the 128px icon as Icon.png
    if [ -f "$icons_dir/icon-128.png" ]; then
        cp "$icons_dir/icon-128.png" "$icons_dir/Icon.png"
    fi
}

# Function to fix Xcode project issues
fix_xcode_project() {
    print_status "Fixing Xcode project issues..."
    
    local shared_resources_dir="$OUTPUT_DIR/$APP_NAME/Shared (App)/Resources"
    
    # Create the Shared (App)/Resources directory if it doesn't exist
    mkdir -p "$shared_resources_dir"
    
    # Copy Icon.png to the expected location
    if [ -f "$EXTENSION_DIR/icons/Icon.png" ]; then
        cp "$EXTENSION_DIR/icons/Icon.png" "$shared_resources_dir/Icon.png"
        print_success "Copied Icon.png to Shared (App)/Resources/"
    else
        print_warning "Icon.png not found, creating placeholder..."
        # Create a simple placeholder
        if [ -f "$EXTENSION_DIR/icons/icon-128.png" ]; then
            cp "$EXTENSION_DIR/icons/icon-128.png" "$shared_resources_dir/Icon.png"
        else
            touch "$shared_resources_dir/Icon.png"
        fi
    fi
    
    print_success "Xcode project issues fixed"
}

# Function to create clean extension directory
create_clean_extension() {
    print_status "Creating clean extension directory..."
    
    # Create temporary clean directory
    CLEAN_EXTENSION_DIR="$OUTPUT_DIR/clean-extension"
    rm -rf "$CLEAN_EXTENSION_DIR"
    mkdir -p "$CLEAN_EXTENSION_DIR"
    
    # Copy only necessary files for Safari extension
    cp "$EXTENSION_DIR/manifests/safari.json" "$CLEAN_EXTENSION_DIR/manifest.json"
    cp "$EXTENSION_DIR/src/background.js" "$CLEAN_EXTENSION_DIR/"
    cp "$EXTENSION_DIR/public/popup.html" "$CLEAN_EXTENSION_DIR/"
    cp "$EXTENSION_DIR/public/settings.html" "$CLEAN_EXTENSION_DIR/"
    
    # Copy JS directory from src
    mkdir -p "$CLEAN_EXTENSION_DIR/js"
    cp "$EXTENSION_DIR"/src/*.js "$CLEAN_EXTENSION_DIR/js/"
    
    # Copy CSS directory from public
    cp -r "$EXTENSION_DIR/public/css" "$CLEAN_EXTENSION_DIR/"
    
    # Copy icons directory
    if [ -d "$EXTENSION_DIR/icons" ]; then
        cp -r "$EXTENSION_DIR/icons" "$CLEAN_EXTENSION_DIR/"
    fi
    
    print_success "Clean extension directory created"
}

# Function to create the Safari extension package
create_safari_package() {
    print_status "Creating Safari extension package..."
    
    # Remove existing output directory if it exists
    if [ -d "$OUTPUT_DIR" ]; then
        print_status "Removing existing output directory..."
        rm -rf "$OUTPUT_DIR"
    fi
    
    # Create clean extension directory
    create_clean_extension
    
    # Create the Safari extension using xcrun
    print_status "Running safari-web-extension-packager..."
    
    xcrun safari-web-extension-packager \
        "$CLEAN_EXTENSION_DIR" \
        --project-location "$OUTPUT_DIR" \
        --app-name "$APP_NAME" \
        --bundle-identifier "$BUNDLE_ID" \
        --swift \
        --copy-resources \
        --no-prompt \
        --force \
        --macos-only
    
    if [ $? -eq 0 ]; then
        print_success "Safari extension package created successfully"
        # Clean up temporary directory
        rm -rf "$CLEAN_EXTENSION_DIR"
        # Fix any Xcode project issues
        fix_xcode_project
    else
        print_error "Failed to create Safari extension package"
        # Clean up temporary directory on failure too
        rm -rf "$CLEAN_EXTENSION_DIR"
        exit 1
    fi
}

# Function to build the Xcode project
build_xcode_project() {
    print_status "Building Xcode project..."
    
    local xcode_project="$OUTPUT_DIR/$APP_NAME/$APP_NAME.xcodeproj"
    
    if [ ! -d "$xcode_project" ]; then
        print_error "Xcode project not found at $xcode_project"
        exit 1
    fi
    
    # Build for macOS
    print_status "Building for macOS..."
    xcodebuild -project "$xcode_project" \
               -scheme "$APP_NAME (macOS)" \
               -configuration Release \
               build
    
    if [ $? -eq 0 ]; then
        print_success "macOS build completed"
    else
        print_error "macOS build failed"
        exit 1
    fi
}

# Function to open the project in Xcode (optional)
open_in_xcode() {
    local xcode_project="$OUTPUT_DIR/$APP_NAME/$APP_NAME.xcodeproj"
    
    if [ -d "$xcode_project" ]; then
        print_status "Opening project in Xcode..."
        open "$xcode_project"
        print_success "Project opened in Xcode"
    else
        print_error "Xcode project not found"
    fi
}

# Function to show usage instructions
show_instructions() {
    echo ""
    echo "=========================================="
    echo "Safari Extension Build Complete!"
    echo "=========================================="
    echo ""
    echo "Your Safari extension has been packaged and is ready for testing."
    echo ""
    echo "📁 Project Location: $OUTPUT_DIR/$APP_NAME/"
    echo "🔧 Xcode Project: $OUTPUT_DIR/$APP_NAME/$APP_NAME.xcodeproj"
    echo ""
    echo "Next Steps:"
    echo "1. Open the Xcode project (automatically opened if --open flag was used)"
    echo "2. Build and run the project (⌘+R)"
    echo "3. The app will install the Safari extension"
    echo "4. Enable the extension in Safari:"
    echo "   - Safari > Settings > Extensions"
    echo "   - Find '$APP_NAME' and enable it"
    echo ""
    echo "For unsigned extensions (development):"
    echo "   - Safari > Settings > Advanced > Show Develop menu"
    echo "   - Develop > Allow Unsigned Extensions"
    echo ""
    echo "For more information, see:"
    echo "https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension"
}

# Main function
main() {
    echo "=========================================="
    echo "EverTrack Safari Extension Builder"
    echo "=========================================="
    
    read_version
    echo "[INFO] Building $APP_NAME v$VERSION"
    
    # Parse command line arguments
    OPEN_XCODE=false
    BUILD_PROJECT=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --open)
                OPEN_XCODE=true
                shift
                ;;
            --build)
                BUILD_PROJECT=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --open    Open the generated Xcode project after packaging"
                echo "  --build   Build the Xcode project after packaging"
                echo "  --help    Show this help message"
                echo ""
                echo "Example:"
                echo "  $0 --open --build"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run the build process
    check_requirements
    validate_extension
    prepare_resources
    create_safari_package
    
    if [ "$BUILD_PROJECT" = true ]; then
        build_xcode_project
    fi
    
    if [ "$OPEN_XCODE" = true ]; then
        open_in_xcode
    fi
    
    show_instructions
    
    print_success "Build script completed successfully!"
}

# Run main function with all arguments
main "$@"