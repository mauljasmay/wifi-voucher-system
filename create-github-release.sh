#!/bin/bash

# WiFi Voucher System - GitHub Release Creator
# Author: Claude Code Assistant
# Version: 1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="mauljasmay"
REPO_NAME="wifi-voucher-system"
VERSION="v1.0.0"
RELEASE_NAME="WiFi Voucher System v1.0.0 - Production Ready"

# ZIP Files
ZIP_FILES=(
    "wifi-voucher-system-release.zip:Optimized ZIP for GitHub Release (230KB)"
    "wifi-voucher-system-complete.zip:Complete Git Archive (372KB)"
)

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

# Function to check if GitHub CLI is available
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        print_status "Install GitHub CLI:"
        print_status "  Ubuntu/Debian: sudo apt install gh"
        print_status "  CentOS/RHEL: sudo dnf install gh"
        print_status "  macOS: brew install gh"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI is not authenticated"
        print_status "Run: gh auth login"
        exit 1
    fi
    
    print_success "GitHub CLI is available and authenticated"
}

# Function to create release notes
create_release_notes() {
    cat > release-notes.md << 'EOF'
# 🎉 WiFi Voucher System v1.0.0 - Production Ready

## 📋 Overview
Complete WiFi Voucher Management System with MikroTik RouterOS integration for production deployment.

## 🚀 Features

### Core System
- ✅ **MikroTik Integration**: Full RouterOS v6 & v7 support
- ✅ **Real-time Management**: User monitoring and control
- ✅ **Voucher System**: Automated WiFi voucher creation
- ✅ **Payment Processing**: QRIS, bank transfer, e-wallets
- ✅ **Admin Dashboard**: Complete management interface

### Technical Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: SQLite (production-ready)
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: JWT, NextAuth.js

## 📦 Installation Options

### Option 1: Ubuntu 22 Server (Recommended)
```bash
# Download and extract
wget https://github.com/mauljasmay/wifi-voucher-system/releases/download/v1.0.0/wifi-voucher-system-release.zip
unzip wifi-voucher-system-release.zip
cd wifi-voucher-system

# Deploy automatically
chmod +x deploy.sh
./deploy.sh
```

### Option 2: cPanel Shared Hosting
```bash
# Download and extract
wget https://github.com/mauljasmay/wifi-voucher-system/releases/download/v1.0.0/wifi-voucher-system-release.zip
unzip wifi-voucher-system-release.zip
cd wifi-voucher-system

# Deploy for cPanel
chmod +x deploy-cpanel.sh
./deploy-cpanel.sh
```

### Option 3: Manual Installation
```bash
# Download and extract
wget https://github.com/mauljasmay/wifi-voucher-system/releases/download/v1.0.0/wifi-voucher-system-release.zip
unzip wifi-voucher-system-release.zip
cd wifi-voucher-system

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Build and start
npm run build
npm start
```

## 📚 Documentation

### Installation Guides
- **[Ubuntu 22 Guide](https://github.com/mauljasmay/wifi-voucher-system/blob/main/INSTALL_UBUNTU.md)** - Complete server setup
- **[cPanel Guide](https://github.com/mauljasmay/wifi-voucher-system/blob/main/INSTALL_CPANEL.md)** - Shared hosting setup
- **[Quick Deploy Ubuntu](https://github.com/mauljasmay/wifi-voucher-system/blob/main/QUICK_DEPLOY.md)** - Fast Ubuntu deployment
- **[Quick Deploy cPanel](https://github.com/mauljasmay/wifi-voucher-system/blob/main/QUICK_CPANEL.md)** - Fast cPanel deployment

### Integration & Troubleshooting
- **[MikroTik Integration](https://github.com/mauljasmay/wifi-voucher-system/blob/main/MIKROTIK_INTEGRATION.md)** - Router configuration
- **[Troubleshooting Guide](https://github.com/mauljasmay/wifi-voucher-system/blob/main/TROUBLESHOOTING.md)** - Error resolution

## 🛠️ System Requirements

### Ubuntu 22 Server
- **OS**: Ubuntu 22.04 LTS or later
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **Node.js**: 18.x or later (auto-installed)

### cPanel Hosting
- **cPanel**: Version 108 or later
- **Node.js**: Available in cPanel
- **Storage**: Minimum 5GB
- **RAM**: Minimum 2GB guaranteed

## 🔧 Configuration

### Post-Installation Setup
1. **Access Admin Panel**: `https://yourdomain.com/admin`
2. **Default Login**: `admin@yourdomain.com` / `admin123`
3. **Configure MikroTik**: Add router settings in admin panel
4. **Setup Vouchers**: Create packages and pricing
5. **Configure Payments**: Setup QRIS and payment methods

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=file:/path/to/database.db
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 🌐 MikroTik Integration

### Supported Features
- **RouterOS v6 & v7**: Automatic version detection
- **User Management**: Create, monitor, and control hotspot users
- **Profile Sync**: Synchronize hotspot profiles
- **Real-time Monitoring**: User statistics and data usage
- **Automatic Voucher Creation**: Generate vouchers on payment

### Configuration
1. **Router Settings**: IP, port, credentials
2. **Hotspot Configuration**: Interface and profile setup
3. **User Limits**: Time and data restrictions
4. **Profile Management**: Create and sync profiles

## 💳 Payment System

### Supported Methods
- **QRIS**: Indonesian QR payment standard
- **Bank Transfer**: Manual bank transfer
- **E-Wallets**: GoPay, OVO, DANA, LinkAja
- **Tripay Integration**: Payment gateway support

### Payment Flow
1. User selects voucher package
2. Choose payment method
3. Complete payment
4. Receive voucher code
5. Automatic MikroTik user creation (if enabled)

## 📊 Admin Features

### Dashboard
- **Real-time Statistics**: Users, revenue, system status
- **User Management**: Monitor and control hotspot users
- **Voucher Management**: Create and manage vouchers
- **MikroTik Control**: Router settings and monitoring
- **Payment Reports**: Transaction history and analytics

### User Management
- **Active Users**: View connected users
- **User Statistics**: Data usage and connection time
- **User Control**: Disconnect, limit, or extend access
- **Profile Assignment**: Assign hotspot profiles to users

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure API authentication
- **Role-Based Access**: Admin and user roles
- **Session Management**: Secure session handling
- **Password Security**: Bcrypt password hashing

### Application Security
- **Rate Limiting**: API request limits
- **CORS Protection**: Cross-origin security
- **Input Validation**: Form and API validation
- **SQL Injection Prevention**: Prisma ORM protection

## 📈 Performance

### Optimization
- **Database Optimization**: SQLite with Prisma
- **Caching**: Static file caching
- **Compression**: Gzip compression
- **CDN Ready**: Static asset optimization

### Monitoring
- **Health Checks**: Application health monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **Resource Usage**: Memory and CPU tracking

## 🔄 Maintenance

### Automated Tasks
- **Database Backups**: Daily automated backups
- **Log Rotation**: Automatic log management
- **SSL Renewal**: Let's Encrypt auto-renewal
- **System Monitoring**: Health check alerts

### Regular Maintenance
- **Weekly**: Check logs and performance
- **Monthly**: Update dependencies
- **Quarterly**: Security updates
- **Yearly**: Major version upgrades

## 🐛 Troubleshooting

### Common Issues
- **npm Installation Errors**: Run `./fix-npm-error.sh`
- **Database Connection**: Check file permissions
- **MikroTik Connection**: Verify router settings
- **Payment Issues**: Check payment gateway configuration

### Support Resources
- **Documentation**: Complete guides and API reference
- **Troubleshooting**: Error resolution guide
- **GitHub Issues**: Report bugs and request features
- **Community**: Discussion and support

## 📝 Changelog

### v1.0.0 (2025-10-27)
- ✅ Initial production release
- ✅ Complete MikroTik RouterOS integration
- ✅ Multi-environment deployment (Ubuntu, cPanel)
- ✅ Comprehensive admin dashboard
- ✅ Payment processing system
- ✅ Real-time user management
- ✅ Security and performance optimization
- ✅ Complete documentation and guides

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/mauljasmay/wifi-voucher-system.git
cd wifi-voucher-system
npm install
npm run dev
```

### Contribution Guidelines
- Fork the repository
- Create feature branch
- Make changes with tests
- Submit pull request
- Follow code standards

## 📞 Support

### Getting Help
- **Documentation**: Check included guides
- **Issues**: [GitHub Issues](https://github.com/mauljasmay/wifi-voucher-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mauljasmay/wifi-voucher-system/discussions)
- **Email**: Support contact information

### Reporting Issues
When reporting issues, please include:
- Operating system and version
- Node.js and npm versions
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

---

## 🎉 Ready for Production!

This WiFi Voucher System is production-ready and includes everything needed for successful deployment:

✅ **Complete Source Code** - Full application with all features  
✅ **Multiple Installation Options** - Ubuntu server, cPanel, manual  
✅ **Automated Deployment Scripts** - One-click setup  
✅ **Comprehensive Documentation** - Installation, configuration, troubleshooting  
✅ **MikroTik Integration** - Full RouterOS v6 & v7 support  
✅ **Payment Processing** - Multiple payment methods  
✅ **Admin Dashboard** - Complete management interface  
✅ **Security & Performance** - Production-optimized  

### Quick Start
1. 📦 Download the release ZIP
2. 🚀 Run deployment script for your environment
3. ⚙️ Configure MikroTik and payment settings
4. 🎫 Create vouchers and start serving customers!

🚀 **Your WiFi Voucher System is ready for production deployment!**
EOF

    print_success "Release notes created"
}

# Function to create GitHub release
create_github_release() {
    print_status "Creating GitHub release..."
    
    # Check if release already exists
    if gh release view $VERSION &> /dev/null; then
        print_warning "Release $VERSION already exists"
        print_status "Deleting existing release..."
        gh release delete $VERSION --yes
    fi
    
    # Create new release
    gh release create $VERSION \
        --title "$RELEASE_NAME" \
        --notes-file release-notes.md \
        --latest
    
    print_success "GitHub release created: $VERSION"
}

# Function to upload ZIP files
upload_zip_files() {
    print_status "Uploading ZIP files to release..."
    
    for zip_info in "${ZIP_FILES[@]}"; do
        IFS=':' read -r zip_file zip_description <<< "$zip_info"
        
        if [[ -f "$zip_file" ]]; then
            print_status "Uploading $zip_file ($zip_description)..."
            
            gh release upload $VERSION "$zip_file" \
                --clobber \
                --label "$zip_description"
            
            print_success "Uploaded $zip_file"
        else
            print_error "File not found: $zip_file"
        fi
    done
}

# Function to verify release
verify_release() {
    print_status "Verifying GitHub release..."
    
    # Get release info
    release_info=$(gh release view $VERSION --json tagName,url,assets)
    
    echo "Release Information:"
    echo "$release_info" | jq '.'
    
    # Check assets
    asset_count=$(echo "$release_info" | jq '.assets | length')
    print_success "Release verified with $asset_count assets"
}

# Function to display release URL
display_release_info() {
    release_url=$(gh release view $VERSION --json url -q '.url')
    
    print_success "🎉 GitHub release created successfully!"
    echo
    echo "=== Release Information ==="
    echo "Version: $VERSION"
    echo "Release URL: $release_url"
    echo "Download URL: https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/"
    echo
    echo "=== Download Links ==="
    for zip_info in "${ZIP_FILES[@]}"; do
        IFS=':' read -r zip_file zip_description <<< "$zip_info"
        echo "📦 $zip_file: https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/$zip_file"
        echo "   $zip_description"
    done
    echo
    echo "=== Quick Installation ==="
    echo "wget https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/wifi-voucher-system-release.zip"
    echo "unzip wifi-voucher-system-release.zip"
    echo "cd wifi-voucher-system"
    echo "# For Ubuntu: ./deploy.sh"
    echo "# For cPanel: ./deploy-cpanel.sh"
    echo
    print_success "Share the release URL with your users! 🚀"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f release-notes.md
    print_success "Cleanup completed"
}

# Main function
main() {
    print_status "Creating GitHub release for WiFi Voucher System..."
    echo "Repository: $REPO_OWNER/$REPO_NAME"
    echo "Version: $VERSION"
    echo
    
    # Check prerequisites
    check_gh_cli
    
    # Create release notes
    create_release_notes
    
    # Create GitHub release
    create_github_release
    
    # Upload ZIP files
    upload_zip_files
    
    # Verify release
    verify_release
    
    # Display release information
    display_release_info
    
    # Cleanup
    cleanup
    
    print_success "GitHub release creation completed! 🎉"
}

# Handle script interruption
trap 'print_error "Script interrupted"; cleanup; exit 1' INT TERM

# Run main function
main "$@"