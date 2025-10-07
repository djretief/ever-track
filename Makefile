# Makefile for EverTrack Safari Extension

.PHONY: dev build release clean help install test icons verify firefox firefox-install chrome chrome-load

# Default target
help:
	@echo "EverTrack Extension Build System"
	@echo ""
	@echo "Safari Extension targets:"
	@echo "  dev       - Quick development build (package + open Xcode)"
	@echo "  build     - Build extension package and Xcode project"
	@echo "  release   - Full release build (package + build + open Xcode)"
	@echo "  clean     - Remove all build artifacts"
	@echo "  install   - Install/reinstall the extension (build + run)"
	@echo "  test      - Run a basic validation test"
	@echo "  icons     - Generate icon files"
	@echo "  verify    - Verify Xcode project is ready to build"
	@echo ""
	@echo "Firefox Extension targets:"
	@echo "  firefox         - Build Firefox extension (.xpi)"
	@echo "  firefox-install - Build and install Firefox extension"
	@echo ""
	@echo "Chrome Extension targets:"
	@echo "  chrome      - Build Chrome extension (.zip)"
	@echo "  chrome-load - Build and open Chrome for loading extension"
	@echo "  firefox-install - Build and install Firefox extension"
	@echo ""
	@echo "  help      - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make dev      # Quick development setup"
	@echo "  make release  # Full release build"
	@echo "  make clean    # Clean build artifacts"

# Development build - quick setup for development
dev:
	@echo "🔧 Starting development build..."
	./build.sh dev

# Build package and Xcode project
build:
	@echo "🔨 Building extension package..."
	./build.sh build

# Full release build
release:
	@echo "🚀 Creating release build..."
	./build.sh release

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	./build.sh clean
	@echo "🧹 Cleaning Firefox build artifacts..."
	rm -rf $(HOME)/Development/EverTrack-Firefox
	@echo "🧹 Cleaning Chrome build artifacts..."
	rm -rf $(HOME)/Development/EverTrack-Chrome

# Install/reinstall the extension
install: build
	@echo "📦 Installing extension..."
	@echo "Opening Xcode project for installation..."
	@open "$(shell pwd)/../EverTrack-Safari/EverTrack/EverTrack.xcodeproj" 2>/dev/null || true

# Basic validation test
test:
	@echo "🧪 Running validation tests..."
	@echo "Checking required files..."
	@test -f manifest.json || (echo "❌ manifest.json missing" && exit 1)
	@test -f popup.html || (echo "❌ popup.html missing" && exit 1)
	@test -f popup.js || (echo "❌ popup.js missing" && exit 1)
	@test -f background.js || (echo "❌ background.js missing" && exit 1)
	@test -f settings.html || (echo "❌ settings.html missing" && exit 1)
	@test -f settings.js || (echo "❌ settings.js missing" && exit 1)
	@echo "✅ All required files present"
	@echo "Checking manifest.json syntax..."
	@python3 -m json.tool manifest.json > /dev/null && echo "✅ manifest.json is valid JSON" || echo "❌ manifest.json has invalid JSON syntax"
	@echo "Checking build script..."
	@test -x build-safari-extension.sh || (echo "❌ build-safari-extension.sh not executable" && exit 1)
	@test -x build.sh || (echo "❌ build.sh not executable" && exit 1)
	@echo "✅ Build scripts are executable"
	@echo "🎉 All tests passed!"

# Verify Xcode project readiness
verify:
	@echo "🔍 Verifying Xcode project..."
	@./verify-project.sh

# Generate icons
icons:
	@echo "🎨 Generating extension icons..."
	@if [ -f .venv/bin/python ]; then \
		.venv/bin/python create-icons.py; \
	elif command -v python3 >/dev/null 2>&1; then \
		python3 create-icons.py; \
	else \
		echo "❌ Python not found. Please install Python 3 to generate icons."; \
		exit 1; \
	fi

# Firefox Extension targets
firefox:
	@echo "🦊 Building Firefox extension..."
	./build-firefox-extension.sh

firefox-install:
	@echo "🦊 Building and installing Firefox extension..."
	./build-firefox-extension.sh --install

# Clean Firefox build artifacts
clean-firefox:
	@echo "🧹 Cleaning Firefox build artifacts..."
	rm -rf $(HOME)/Development/EverTrack-Firefox

# Chrome extension targets
chrome:
	@echo "🔵 Building Chrome extension..."
	./build-chrome-extension.sh

chrome-load:
	@echo "🔵 Building and loading Chrome extension..."
	./build-chrome-extension.sh --load

# Clean Chrome build artifacts
clean-chrome:
	@echo "🧹 Cleaning Chrome build artifacts..."
	rm -rf $(HOME)/Development/EverTrack-Chrome

# Quick aliases
d: dev
f: firefox
c: chrome
b: build
r: release
c: clean
i: install
t: test