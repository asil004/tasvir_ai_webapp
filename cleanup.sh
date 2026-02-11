#!/bin/bash

# Tasvir AI WebApp - Cleanup & Maintenance Script
# VPS disk space tozalash va optimizatsiya

set -e

echo "🧹 Starting cleanup..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check disk space before
echo ""
echo "📊 Disk space BEFORE cleanup:"
df -h | grep -E '^/dev/|Filesystem'

# 1. Docker system prune
print_warning "Cleaning unused Docker resources..."
docker system prune -f --volumes
print_success "Docker cleanup complete"

# 2. Remove old/dangling images
print_warning "Removing dangling images..."
docker image prune -f
print_success "Image cleanup complete"

# 3. Clean old logs
print_warning "Cleaning old logs..."
sudo find /var/lib/docker/containers/ -name "*.log" -type f -size +50M -delete 2>/dev/null || true
print_success "Log cleanup complete"

# 4. Clean npm cache (if needed)
if [ -d "webapp/node_modules" ]; then
    print_warning "Checking npm cache..."
    cd webapp && npm cache clean --force 2>/dev/null || true
    cd ..
    print_success "npm cache cleaned"
fi

# 5. Clean old build artifacts
print_warning "Cleaning build artifacts..."
rm -rf webapp/.next/cache 2>/dev/null || true
print_success "Build artifacts cleaned"

# 6. System package cache (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    print_warning "Cleaning apt cache..."
    sudo apt-get clean 2>/dev/null || true
    sudo apt-get autoclean 2>/dev/null || true
    sudo apt-get autoremove -y 2>/dev/null || true
    print_success "APT cache cleaned"
fi

# Check disk space after
echo ""
echo "📊 Disk space AFTER cleanup:"
df -h | grep -E '^/dev/|Filesystem'

echo ""
print_success "Cleanup complete! 🎉"

# Show container stats
echo ""
echo "📈 Current container stats:"
docker stats --no-stream tasvir-ai-webapp 2>/dev/null || echo "Container not running"
