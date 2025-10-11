#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new-version>"
    echo "Example: $0 0.2.0"
    exit 1
fi

NEW_VERSION="$1"

# Validate version format (semantic versioning)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be in format X.Y.Z (e.g., 0.2.0)"
    exit 1
fi

echo "🔄 Updating version to $NEW_VERSION..."

# Update version.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" version.json

# Update package.json if it exists
if [ -f "package.json" ]; then
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
fi

# Update all manifest files in manifests directory
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" manifests/safari.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" manifests/firefox.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" manifests/chrome.json

echo "✅ Version updated to $NEW_VERSION in all manifest files"
echo "📝 Don't forget to update the CHANGELOG.md and commit your changes!"