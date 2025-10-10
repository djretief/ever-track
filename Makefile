# Makefile for EverTrack Cross-Browser Extension

.PHONY: help safari firefox chrome all clean test icons dev build release install verify
.# Clean individual browser artifacts
clean-safari:
	@echo "🧹 Cleaning Safari build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Safari"

clean-firefox:
	@echo "🧹 Cleaning Firefox build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Firefox"

clean-chrome:
	@echo "🧹 Cleaning Chrome build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Chrome"i-install firefox-install chrome-load clean-safari clean-firefox clean-chrome

# Default target
help:
	@echo "EverTrack Cross-Browser Extension Build System"
	@echo ""
	@echo "Main targets:"
	@echo "  all       - Build for all browsers (Safari, Firefox, Chrome)"
	@echo "  safari    - Build Safari extension (Xcode project)"
	@echo "  firefox   - Build Firefox extension (.xpi)"
	@echo "  chrome    - Build Chrome extension (.zip)"
	@echo "  clean     - Remove all build artifacts"
	@echo "  test      - Run validation tests"
	@echo "  icons     - Generate icon files"
	@echo ""
	@echo "Safari targets:"
	@echo "  dev       - Quick development build (package + open Xcode)"
	@echo "  build     - Build Safari extension package and Xcode project"
	@echo "  release   - Full release build (package + build + open Xcode)"
	@echo "  install   - Build and open Safari extension in Xcode"
	@echo "  verify    - Verify Xcode project is ready to build"
	@echo ""
	@echo "Firefox targets:"
	@echo "  firefox-install - Build and install Firefox extension"
	@echo ""
	@echo "Chrome targets:"
	@echo "  chrome-load - Build and open Chrome for loading extension"
	@echo ""
	@echo "Examples:"
	@echo "  make all      # Build for all browsers"
	@echo "  make safari   # Build Safari extension"
	@echo "  make dev      # Quick Safari development setup"
	@echo "  make clean    # Clean all build artifacts"

# Build for all browsers
all:
	@echo "🌐 Building for all browsers..."
	@echo "🍎 Building Safari extension..."
	./build-safari-extension.sh
	@echo "🦊 Building Firefox extension..."
	./build-firefox-extension.sh
	@echo "🔵 Building Chrome extension..."
	./build-chrome-extension.sh
	@echo "✅ All browsers built successfully!"

# Safari Extension targets
safari:
	@echo "🍎 Building Safari extension..."
	./build-safari-extension.sh

# Development build - quick setup for development
dev:
	@echo "🔧 Starting Safari development build..."
	./build-safari-extension.sh --open

# Build package and Xcode project
build:
	@echo "🔨 Building Safari extension package..."
	./build-safari-extension.sh --build

# Full release build
release:
	@echo "🚀 Creating Safari release build..."
	./build-safari-extension.sh --build --open

# Install/reinstall the Safari extension
install: safari
	@echo "📦 Opening Safari extension in Xcode..."
	@open "$(pwd)/../EverTrack-Safari/EverTrack/EverTrack.xcodeproj" 2>/dev/null || true

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
	@echo "Checking build scripts..."
	@test -x build-safari-extension.sh || (echo "❌ build-safari-extension.sh not executable" && exit 1)
	@test -x build-firefox-extension.sh || (echo "❌ build-firefox-extension.sh not executable" && exit 1)
	@test -x build-chrome-extension.sh || (echo "❌ build-chrome-extension.sh not executable" && exit 1)
	@echo "✅ Build scripts are executable"
	@echo "🎉 All tests passed!"

# Clean all build artifacts
clean:
	@echo "🧹 Cleaning all build artifacts..."
	@echo "🧹 Cleaning Safari build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Safari"
	@echo "🧹 Cleaning Firefox build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Firefox"
	@echo "🧹 Cleaning Chrome build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Chrome"
	@echo "✅ All build artifacts cleaned"

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

# Chrome extension targets
chrome:
	@echo "🔵 Building Chrome extension..."
	./build-chrome-extension.sh

chrome-load:
	@echo "🔵 Building and loading Chrome extension..."
	./build-chrome-extension.sh --load

# Clean individual browser artifacts
clean-safari:
	@echo "🧹 Cleaning Safari build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Safari"

clean-firefox:
	@echo "🧹 Cleaning Firefox build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Firefox"

clean-chrome:
	@echo "🧹 Cleaning Chrome build artifacts..."
	rm -rf "$(pwd)/../EverTrack-Chrome"

# Quick aliases
d: dev
f: firefox
ch: chrome
b: build
r: release
cl: clean
i: install
t: test