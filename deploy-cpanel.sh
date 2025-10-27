#!/bin/bash

# WiFi Voucher System - cPanel Deployment Script
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
APP_NAME="wifi-voucher"
APP_DIR="$HOME/$APP_NAME"
DOMAIN="yourdomain.com" # Change this to your actual domain
CPANEL_USER="$USER"

# Logging
LOG_FILE="$HOME/deploy-cpanel.log"

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

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Function to check if we're in cPanel
check_cpanel() {
    if [[ ! -d "/usr/local/cpanel" ]]; then
        print_error "This script must be run on a cPanel server"
        exit 1
    fi
    print_success "cPanel environment detected"
}

# Function to check Node.js availability
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed or not in PATH"
        print_status "Please install Node.js via cPanel -> Setup Node.js App"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION and npm $NPM_VERSION detected"
}

# Function to setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    if [[ -d "$APP_DIR" ]]; then
        print_warning "Application directory already exists, backing up..."
        mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    print_success "Application directory created: $APP_DIR"
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository..."
    
    git clone https://github.com/mauljasmay/wifi-voucher-system.git .
    
    print_success "Repository cloned successfully"
}

# Function to setup cPanel-specific files
setup_cpanel_files() {
    print_status "Setting up cPanel-specific files..."
    
    # Copy cPanel package.json
    cp package-cpanel-simple.json package.json
    
    # Copy environment template
    cp .env.cpanel .env.template
    
    # Update environment file with actual paths
    sed -i "s|/home/username|$HOME|g" .env.template
    sed -i "s|yourdomain.com|$DOMAIN|g" .env.template
    
    print_success "cPanel files configured"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    # Install production dependencies
    npm install --production
    
    # Install Prisma CLI globally
    npm install -g prisma
    
    print_success "Dependencies installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [[ ! -f ".env" ]]; then
        cp .env.template .env
        
        # Generate secrets
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        
        # Update secrets in .env
        sed -i "s/your-super-secret-key-change-this-in-production/$NEXTAUTH_SECRET/g" .env
        sed -i "s/your-jwt-secret-key-change-this-in-production/$JWT_SECRET/g" .env
        sed -i "s/your-32-character-encryption-key-here/$ENCRYPTION_KEY/g" .env
        
        print_success "Environment file created with secure secrets"
    else
        print_status "Environment file already exists"
    fi
    
    # Create necessary directories
    mkdir -p db logs backups
    
    print_success "Environment setup complete"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    # Set database permissions
    chmod 600 db/production.db
    
    print_success "Database setup complete"
}

# Function to build application
build_application() {
    print_status "Building application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build application
    npm run build
    
    print_success "Application built successfully"
}

# Function to set permissions
set_permissions() {
    print_status "Setting file permissions..."
    
    # Set proper permissions for cPanel
    find . -type d -exec chmod 755 {} \;
    find . -type f -exec chmod 644 {} \;
    chmod 600 .env
    chmod 755 db logs backups
    chmod 600 db/production.db 2>/dev/null || true
    
    print_success "File permissions set"
}

# Function to create .htaccess
create_htaccess() {
    print_status "Creating .htaccess file..."
    
    cat > .htaccess << 'EOF'
# WiFi Voucher System - cPanel .htaccess

# Handle Next.js static files
RewriteEngine On
RewriteBase /

# Block access to sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.db">
    Order allow,deny
    Deny from all
</Files>

<Files "logs/*">
    Order allow,deny
    Deny from all
</Files>

<Files "package*.json">
    Order allow,deny
    Deny from all
</Files>

# Prevent directory listing
Options -Indexes

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/icon "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Redirect to Node.js app for non-static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
EOF
    
    print_success ".htaccess file created"
}

# Function to create admin user
create_admin_user() {
    print_status "Creating default admin user..."
    
    node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: 'admin@$DOMAIN' }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@$DOMAIN',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'SUPER_ADMIN'
      }
    });
    console.log('Admin user created successfully');
    console.log('Email: admin@$DOMAIN');
    console.log('Password: admin123');
    console.log('Please change the password after first login');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
"
    
    print_success "Admin user created"
}

# Function to setup cron jobs
setup_cron_jobs() {
    print_status "Setting up cron jobs..."
    
    # Create backup script
    cat > backup.sh << EOF
#!/bin/bash
# WiFi Voucher System Backup Script

BACKUP_DIR="$HOME/backups/wifi-voucher"
DB_PATH="$APP_DIR/db/production.db"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
if [[ -f "\$DB_PATH" ]]; then
    cp \$DB_PATH \$BACKUP_DIR/production_\$DATE.db
    gzip \$BACKUP_DIR/production_\$DATE.db
    
    # Remove old backups (keep last 7 days)
    find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete
    
    echo "Database backup completed: \$BACKUP_DIR/production_\$DATE.db.gz"
else
    echo "Database file not found: \$DB_PATH"
fi
EOF
    
    chmod +x backup.sh
    
    # Add cron job (if not already exists)
    (crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -
    
    print_success "Cron jobs configured"
}

# Function to display cPanel instructions
display_cpanel_instructions() {
    print_success "🎉 WiFi Voucher System deployment completed!"
    echo
    echo "=== cPanel Configuration Required ==="
    echo "1. Go to cPanel -> Setup Node.js App"
    echo "2. Click 'Create Application' or edit existing"
    echo "3. Configure application settings:"
    echo "   - Node.js Version: 20.x"
    echo "   - Application Mode: Production"
    echo "   - Application Root: $APP_NAME"
    echo "   - Application URL: Select your domain"
    echo "   - Application Startup File: server.js"
    echo
    echo "4. Add Environment Variables in cPanel:"
    echo "   - NODE_ENV=production"
    echo "   - DATABASE_URL=file:$APP_DIR/db/production.db"
    echo "   - NEXTAUTH_URL=https://$DOMAIN"
    echo "   - NEXTAUTH_SECRET=$(grep NEXTAUTH_SECRET .env | cut -d'=' -f2)"
    echo "   - JWT_SECRET=$(grep JWT_SECRET .env | cut -d'=' -f2)"
    echo "   - ENCRYPTION_KEY=$(grep ENCRYPTION_KEY .env | cut -d'=' -f2)"
    echo
    echo "5. Click 'Restart' in cPanel Node.js Manager"
    echo
    echo "=== Access Information ==="
    echo "Application URL: https://$DOMAIN"
    echo "Admin Panel: https://$DOMAIN/admin"
    echo "Admin Email: admin@$DOMAIN"
    echo "Admin Password: admin123"
    echo
    echo "=== Important ==="
    echo "1. Change the default admin password immediately"
    echo "2. Configure your MikroTik settings in admin panel"
    echo "3. Setup voucher packages and pricing"
    echo "4. Configure payment methods"
    echo
    echo "=== Useful Commands ==="
    echo "Application directory: cd $APP_DIR"
    echo "View logs: tail -f logs/app.log"
    echo "Database operations: npx prisma studio"
    echo "Restart application: Use cPanel Node.js Manager"
    echo
    print_success "Ready for cPanel configuration! 🚀"
}

# Function to display next steps
display_next_steps() {
    echo
    echo "=== Next Steps ==="
    echo "1. ⚙️  Configure application in cPanel Node.js Manager"
    echo "2. 🔐 Configure SSL certificate in cPanel"
    echo "3. 👤 Login to admin panel and change password"
    echo "4. 🌐 Configure MikroTik router settings"
    echo "5. 💳 Setup payment methods"
    echo "6. 🎫 Create voucher packages"
    echo "7. 🧪 Test complete system"
    echo
    echo "=== Troubleshooting ==="
    echo "If application doesn't start:"
    echo "- Check cPanel Node.js App logs"
    echo "- Verify environment variables in cPanel"
    echo "- Check file permissions: find $APP_DIR -type f -name '*.log' -exec tail -10 {} \\;"
    echo "- Restart application in cPanel Node.js Manager"
    echo
    print_success "Deployment completed successfully! 🎉"
}

# Main deployment function
main() {
    print_status "Starting WiFi Voucher System cPanel deployment..."
    log_message "cPanel deployment started"
    
    # Check environment
    check_cpanel
    check_nodejs
    
    # Setup application
    setup_app_directory
    clone_repository
    setup_cpanel_files
    install_dependencies
    setup_environment
    setup_database
    build_application
    set_permissions
    create_htaccess
    
    # Setup users and automation
    create_admin_user
    setup_cron_jobs
    
    # Display instructions
    display_cpanel_instructions
    display_next_steps
    
    log_message "cPanel deployment completed successfully"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Check if domain is configured
if [[ "$DOMAIN" == "yourdomain.com" ]]; then
    print_error "Please update the DOMAIN variable in this script"
    print_status "Edit deploy-cpanel.sh and change DOMAIN to your actual domain"
    exit 1
fi

# Run main function
main "$@"