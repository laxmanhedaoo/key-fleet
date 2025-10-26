#!/bin/bash
set -e  # Exit on error

# === Config ===
BUILD_DIR="lambda_build"
ZIP_FILE="lambda_function.zip"

echo "🚀 Starting Lambda packaging process..."

# 1. Clean up any previous build
rm -rf "$BUILD_DIR" "$ZIP_FILE"

# 2. Create build directory
mkdir "$BUILD_DIR"

# 3. Copy files and folders
echo "📦 Copying files..."
cp -r dist/* "$BUILD_DIR"/
cp -r node_modules "$BUILD_DIR"/
cp package.json "$BUILD_DIR"/

# 4. Go inside the build directory and zip everything
echo "🧩 Creating ZIP archive..."
cd "$BUILD_DIR"
zip -r "../$ZIP_FILE" . > /dev/null

cd ..
rm -rf "$BUILD_DIR"
echo "✅ Lambda package created: $ZIP_FILE"
