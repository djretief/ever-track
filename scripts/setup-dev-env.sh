#!/bin/bash

# EverTrack Development Environment Setup Script
# This script helps set up the development environment for EverTrack

set -e

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

print_status "EverTrack Development Environment Setup"
echo "======================================"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_warning "This script is designed for macOS. You may need to adapt the instructions for your OS."
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    print_error "Homebrew is not installed"
    echo ""
    echo "Please install Homebrew first:"
    echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "Then run this script again."
    exit 1
fi

print_success "Homebrew found"

# Check for Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed"
    echo ""
    print_status "Installing Node.js via Homebrew..."
    
    # Install Node.js
    if brew install node; then
        print_success "Node.js installed successfully"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not available"
    echo "Node.js should include npm. Please check your Node.js installation."
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
fi

# Install project dependencies
print_status "Installing project dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build TypeScript
print_status "Building TypeScript..."
if npm run build:ts; then
    print_success "TypeScript compiled successfully"
else
    print_warning "TypeScript compilation failed (this is normal if no .ts files exist yet)"
fi

# Run linting (optional)
print_status "Running code quality checks..."
if npm run lint:check; then
    print_success "Code quality checks passed"
else
    print_warning "Code quality checks found issues (this is normal for initial setup)"
fi

echo ""
print_success "Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  npm run build          - Build TypeScript and all extensions"
echo "  npm run build:ts       - Build TypeScript only"
echo "  npm run watch          - Watch TypeScript files for changes"
echo "  npm run lint           - Run ESLint and fix issues"
echo "  npm run lint:check     - Check code quality without fixing"
echo "  npm run type-check     - Type check TypeScript without building"
echo "  npm run test           - Run all quality checks"
echo ""
echo "Browser-specific builds:"
echo "  npm run build:safari   - Build Safari extension"
echo "  npm run build:firefox  - Build Firefox extension"
echo "  npm run build:chrome   - Build Chrome extension"
echo ""
echo "Development shortcuts:"
echo "  npm run dev:safari     - Quick Safari development setup"
echo "  npm run dev:firefox    - Install Firefox extension for testing"
echo "  npm run dev:chrome     - Load Chrome extension for testing"
echo ""
echo "Release management:"
echo "  npm run bump           - Bump version number"
echo "  npm run release        - Create release build"
echo ""
print_status "To get started, try: npm run build"