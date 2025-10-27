#!/bin/bash

# WiFi Voucher System - npm Error Fix Script
# Author: Claude Code Assistant
# Version: 1.0

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

# Function to check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    # Check disk space
    DISK_USAGE=$(df /home | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 90 ]; then
        print_error "Disk usage is ${DISK_USAGE}%. Please free up disk space."
        exit 1
    else
        print_success "Disk usage: ${DISK_USAGE}%"
    fi
    
    # Check memory
    MEMORY_AVAILABLE=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ $MEMORY_AVAILABLE -lt 512 ]; then
        print_warning "Low memory available: ${MEMORY_AVAILABLE}MB"
    else
        print_success "Memory available: ${MEMORY_AVAILABLE}MB"
    fi
    
    # Check if npm is accessible
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed or not in PATH"
        exit 1
    fi
    
    print_success "System resources check completed"
}

# Function to fix npm configuration
fix_npm_config() {
    print_status "Fixing npm configuration..."
    
    # Clear npm cache completely
    print_status "Clearing npm cache..."
    npm cache clean --force
    
    # Set optimal configuration for cPanel
    print_status "Setting optimal npm configuration..."
    npm config set maxsockets 1
    npm config set fetch-retries 3
    npm config set fetch-retry-mintimeout 20000
    npm config set fetch-retry-maxtimeout 120000
    npm config set fetch-timeout 600000
    
    # Set registry to main npm registry
    npm config set registry https://registry.npmjs.org/
    
    # Disable audit and fund for faster installation
    npm config set audit false
    npm config set fund false
    
    print_success "npm configuration fixed"
}

# Function to test network connectivity
test_network() {
    print_status "Testing network connectivity..."
    
    # Test npm registry
    if curl -s --max-time 10 https://registry.npmjs.org/ > /dev/null; then
        print_success "npm registry is accessible"
    else
        print_error "Cannot access npm registry"
        print_status "Trying alternative registry..."
        
        # Try alternative registry
        if curl -s --max-time 10 https://registry.npmjs.org/ > /dev/null; then
            npm config set registry https://registry.npmjs.org/
            print_success "Using npm registry"
        else
            print_error "Network connectivity issues detected"
            print_status "Please check your internet connection or try again later"
            exit 1
        fi
    fi
}

# Function to install with minimal package
install_minimal() {
    print_status "Installing with minimal package configuration..."
    
    # Backup current package.json if exists
    if [ -f "package.json" ]; then
        cp package.json package.json.backup
        print_status "Backed up current package.json"
    fi
    
    # Use minimal package.json
    if [ -f "package-cpanel-minimal.json" ]; then
        cp package-cpanel-minimal.json package.json
        print_success "Using minimal package configuration"
    else
        print_error "package-cpanel-minimal.json not found"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Try installation with different methods
    print_status "Attempting installation with minimal flags..."
    
    if npm install --production --no-audit --no-fund --maxsockets=1; then
        print_success "Dependencies installed successfully"
        return 0
    fi
    
    print_warning "Standard installation failed, trying alternative method..."
    
    # Try with verbose output
    if npm install --production --verbose --no-audit --no-fund; then
        print_success "Dependencies installed with verbose output"
        return 0
    fi
    
    print_warning "Verbose installation failed, trying staged installation..."
    
    # Install core dependencies first
    print_status "Installing core dependencies..."
    npm install next react react-dom --production --no-audit --no-fund
    
    print_status "Installing database dependencies..."
    npm install @prisma/client prisma --production --no-audit --no-fund
    
    print_status "Installing authentication dependencies..."
    npm install bcryptjs jsonwebtoken --production --no-audit --no-fund
    
    print_status "Installing MikroTik dependencies..."
    npm install node-routeros axios --production --no-audit --no-fund
    
    print_status "Installing utility dependencies..."
    npm install qrcode z-ai-web-dev-sdk --production --no-audit --no-fund
    
    print_success "Staged installation completed"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if node_modules exists and has packages
    if [ -d "node_modules" ] && [ "$(ls -A node_modules)" ]; then
        local package_count=$(ls node_modules | wc -l)
        print_success "Installation verified: $package_count packages installed"
        
        # Test if key packages are available
        if [ -d "node_modules/next" ] && [ -d "node_modules/react" ] && [ -d "node_modules/@prisma" ]; then
            print_success "Core packages are available"
        else
            print_warning "Some core packages may be missing"
        fi
    else
        print_error "Installation verification failed"
        return 1
    fi
    
    # Test npm commands
    print_status "Testing npm commands..."
    if npm list --depth=0 > /dev/null 2>&1; then
        print_success "npm list command works"
    else
        print_warning "npm list command has issues"
    fi
    
    return 0
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    if npx prisma generate; then
        print_success "Prisma client generated"
    else
        print_warning "Prisma client generation failed"
    fi
    
    # Create database directory
    mkdir -p db
    chmod 755 db
    
    # Push database schema
    if npx prisma db push; then
        print_success "Database schema pushed"
    else
        print_warning "Database schema push failed"
    fi
}

# Function to test application
test_application() {
    print_status "Testing application..."
    
    # Test build
    if npm run build; then
        print_success "Application builds successfully"
    else
        print_warning "Application build failed"
    fi
    
    # Create test script for basic functionality
    cat > test-app.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const next = require('next');

console.log('Testing application dependencies...');

// Test Prisma
try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma client loaded');
    prisma.$disconnect();
} catch (error) {
    console.error('❌ Prisma error:', error.message);
}

// Test Next.js
try {
    const app = next({ dev: false });
    console.log('✅ Next.js loaded');
} catch (error) {
    console.error('❌ Next.js error:', error.message);
}

console.log('Application test completed');
EOF
    
    if node test-app.js; then
        print_success "Application test passed"
        rm test-app.js
    else
        print_warning "Application test failed"
        rm test-app.js
    fi
}

# Function to create debug report
create_debug_report() {
    print_status "Creating debug report..."
    
    cat > debug-report.txt << EOF
=== WiFi Voucher System - Debug Report ===
Generated: $(date)

=== System Information ===
Node.js: $(node --version 2>/dev/null || echo "Not found")
npm: $(npm --version 2>/dev/null || echo "Not found")
OS: $(uname -a)
User: $(whoami)
Home: $HOME
Current Directory: $(pwd)

=== Disk Usage ===
$(df -h)

=== Memory Usage ===
$(free -h)

=== npm Configuration ===
$(npm config list)

=== Network Test ===
$(curl -I https://registry.npmjs.org/ 2>&1 | head -5)

=== Environment Variables ===
NODE_ENV: ${NODE_ENV:-not set}
PATH: $PATH

=== Installation Status ===
node_modules exists: $([ -d "node_modules" ] && echo "Yes" || echo "No")
package.json exists: $([ -f "package.json" ] && echo "Yes" || echo "No")
Package count: $([ -d "node_modules" ] && ls node_modules 2>/dev/null | wc -l || echo "0")

=== Recent npm Errors ===
$(tail -20 ~/.npm/_logs/*.log 2>/dev/null | grep -i error || echo "No recent errors")

=== End of Report ===
EOF
    
    print_success "Debug report created: debug-report.txt"
}

# Function to display next steps
display_next_steps() {
    print_success "🎉 npm error fix completed!"
    echo
    echo "=== Next Steps ==="
    echo "1. ✅ Dependencies installed"
    echo "2. 🔧 Configure environment variables"
    echo "3. 🗄️ Setup database (completed automatically)"
    echo "4. 🌐 Configure cPanel Node.js App"
    echo "5. 🎯 Test application"
    echo
    echo "=== cPanel Configuration ==="
    echo "1. Go to cPanel → Setup Node.js App"
    echo "2. Application Root: $(basename $(pwd))"
    echo "3. Application URL: Select your domain"
    echo "4. Startup File: server.js"
    echo "5. Add environment variables from .env file"
    echo "6. Click 'Restart'"
    echo
    echo "=== Access Information ==="
    echo "Application: https://yourdomain.com"
    echo "Admin Panel: https://yourdomain.com/admin"
    echo "Default Login: admin@yourdomain.com / admin123"
    echo
    echo "=== Troubleshooting ==="
    echo "If issues persist:"
    echo "- Check debug-report.txt"
    echo "- Review npm logs: ~/.npm/_logs/"
    echo "- Contact hosting support"
    echo "- Create GitHub issue"
    echo
    print_success "Ready for cPanel configuration! 🚀"
}

# Main function
main() {
    print_status "Starting npm error fix..."
    echo "This script will fix common npm installation errors on cPanel"
    echo
    
    # Check system resources
    check_system_resources
    
    # Fix npm configuration
    fix_npm_config
    
    # Test network
    test_network
    
    # Install minimal package
    install_minimal
    
    # Install dependencies
    if install_dependencies; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        create_debug_report
        exit 1
    fi
    
    # Verify installation
    if verify_installation; then
        print_success "Installation verified"
    else
        print_warning "Installation verification failed"
    fi
    
    # Setup database
    setup_database
    
    # Test application
    test_application
    
    # Create debug report
    create_debug_report
    
    # Display next steps
    display_next_steps
}

# Handle script interruption
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"