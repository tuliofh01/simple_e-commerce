#!/bin/bash
# Project Synchronization & Build Script
# Installs dependencies, builds, and updates context.

set -e

echo "==========================================="
echo "   Simple E-Commerce Sync & Build"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 1. Install Backend Dependencies
status "Installing Backend Dependencies (DLang)..."
cd apps/api
if ! command -v dub &> /dev/null; then
    warn "DLang/Dub not found. Please install DLang SDK."
else
    status "Updating DLang dependencies..."
    dub upgrade || warn "Dub upgrade failed (might be first run)."
fi

# 2. Install Frontend Dependencies
status "Installing Frontend Dependencies (Angular)..."
cd ../web
if ! command -v npm &> /dev/null; then
    warn "Node.js/NPM not found. Please install Node.js."
else
    status "Installing NPM packages..."
    npm install
fi

# 3. Generate Context
status "Generating AI Context..."
cd ../..
status "Compiling Checkpoint Tool..."
cd tools
if [ -f "checkpoint.d" ]; then
    # Compile and run checkpoint (if dub is available)
    # For now, just ensure the script is executable
    chmod +x sync.sh
fi

# 4. Build Backend
status "Building Backend..."
cd ../api
dub build --build=release

# 5. Build Frontend
status "Building Frontend..."
cd ../web
npm run build

status "==========================================="
status "   Sync Complete!"
status "==========================================="
status "To start the project:"
status "  API: cd apps/api && dub run"
status "  Web: cd apps/web && npm start"
