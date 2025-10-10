#!/bin/bash

# Quick verification script to check if the Xcode project is ready to build

XCODE_PROJECT="$(pwd)/../EverTrack-Safari/EverTrack/EverTrack.xcodeproj"
REQUIRED_ICON="$(pwd)/../EverTrack-Safari/EverTrack/Shared (App)/Resources/Icon.png"

echo "🔍 Verifying Xcode project readiness..."

# Check if Xcode project exists
if [ ! -d "$XCODE_PROJECT" ]; then
    echo "❌ Xcode project not found. Run './build.sh dev' first."
    exit 1
fi

echo "✅ Xcode project found"

# Check if Icon.png exists in the required location
if [ ! -f "$REQUIRED_ICON" ]; then
    echo "❌ Icon.png missing from Shared (App)/Resources/"
    echo "💡 This will cause a build error. Rebuild with './build.sh dev' to fix."
    exit 1
fi

echo "✅ Icon.png found in correct location"

# Check if we can read the project file
if [ -r "$XCODE_PROJECT/project.pbxproj" ]; then
    echo "✅ Xcode project file is readable"
else
    echo "❌ Cannot read Xcode project file"
    exit 1
fi

echo ""
echo "🎉 Xcode project verification complete!"
echo "📁 Project: $XCODE_PROJECT"
echo "🏃‍♂️ Ready to build and run in Xcode"
echo ""
echo "Next steps:"
echo "1. Open Xcode project (should already be open)"
echo "2. Select 'EverTrack (macOS)' scheme"
echo "3. Press ⌘+R to build and run"