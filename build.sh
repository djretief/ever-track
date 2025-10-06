#!/bin/bash

# Quick build script for EverTrack Safari Extension
# This script provides convenient shortcuts for common build tasks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_SCRIPT="$SCRIPT_DIR/build-safari-extension.sh"

case "$1" in
    "dev"|"development")
        echo "🔧 Building for development (with Xcode opened)..."
        "$BUILD_SCRIPT" --open
        ;;
    "build")
        echo "🔨 Building extension package and Xcode project..."
        "$BUILD_SCRIPT" --build
        ;;
    "release")
        echo "🚀 Building for release (build + open)..."
        "$BUILD_SCRIPT" --build --open
        ;;
    "clean")
        echo "🧹 Cleaning build artifacts..."
        rm -rf "/Users/danielretief/Development/EverTrack-Safari"
        echo "✅ Clean completed"
        ;;
    "help"|"--help"|"-h"|"")
        echo "EverTrack Safari Extension Build Helper"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  dev        Build and open in Xcode for development"
        echo "  build      Build the extension package and Xcode project"
        echo "  release    Build everything and open in Xcode"
        echo "  clean      Remove all build artifacts"
        echo "  help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 dev      # Quick development build"
        echo "  $0 release  # Full release build"
        echo ""
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac