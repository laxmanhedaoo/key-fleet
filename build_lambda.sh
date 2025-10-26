#!/bin/bash
set -e  # Exit on error

# === Config ===
BUILD_DIR="lambda_build"
ZIP_FILE="lambda_function.zip"

echo "Build Project"
npm install
npm run build

echo "Starting Lambda packaging process..."

rm -rf "$BUILD_DIR" "$ZIP_FILE"

mkdir "$BUILD_DIR"

echo "Copying files..."
cp -r dist/* "$BUILD_DIR"/
cp -r node_modules "$BUILD_DIR"/
cp package.json "$BUILD_DIR"/

echo "Creating ZIP archive..."
cd "$BUILD_DIR"
zip -r "../$ZIP_FILE" . > /dev/null

cd ..
rm -rf "$BUILD_DIR"
echo "Lambda package created: $ZIP_FILE"
