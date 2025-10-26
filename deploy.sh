#!/bin/bash

# WiFi Voucher System - Ubuntu 22 Auto Deployment Script
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
APP_DIR="/var/www/wifi-voucher"
APP_USER="www-data"
NODE_VERSION="20"
DOMAIN="your-domain.com" # Change this to your actual domain

# Logging
LOG_FILE="/var/log/wifi-voucher-deploy.log"

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

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        print_status "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Function to detect Ubuntu version
check_ubuntu() {
    if ! grep -q "Ubuntu 22" /etc/os-release; then
        print_error "This script is designed for Ubuntu 22.04 LTS"
        exit 1
    fi
    print_success "Ubuntu 22.04 detected"
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System updated"
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js $NODE_VERSION..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$CURRENT_VERSION" == "$NODE_VERSION" ]]; then
            print_success "Node.js $NODE_VERSION is already installed"
            return
        fi
    fi
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Verify installation
    NODE_VER=$(node --version)
    NPM_VER=$(npm --version)
    print_success "Node.js $NODE_VER and npm $NPM_VER installed"
}

# Function to install required packages
install_packages() {
    print_status "Installing required packages..."
    
    packages=(
        "curl"
        "wget"
        "git"
        "unzip"
        "software-properties-common"
        "build-essential"
        "python3"
        "python3-pip"
        "nginx"
        "certbot"
        "python3-certbot-nginx"
    )
    
    for package in "${packages[@]}"; do
        if ! dpkg -l | grep -q "^ii.*$package "; then
            print_status "Installing $package..."
            sudo apt install -y $package
        else
            print_status "$package is already installed"
        fi
    done
    
    print_success "All required packages installed"
}

# Function to install PM2
install_pm2() {
    print_status "Installing PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
        print_success "PM2 installed"
    else
        print_status "PM2 is already installed"
    fi
}

# Function to setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    # Create directory if it doesn't exist
    if [[ ! -d "$APP_DIR" ]]; then
        sudo mkdir -p $APP_DIR
        print_status "Created application directory"
    fi
    
    # Set permissions
    sudo chown -R $USER:$USER $APP_DIR
    chmod -R 755 $APP_DIR
    
    print_success "Application directory setup complete"
}

# Function to clone or update repository
setup_repository() {
    print_status "Setting up application repository..."
    
    if [[ -d "$APP_DIR/.git" ]]; then
        print_status "Repository exists, pulling latest changes..."
        cd $APP_DIR
        git pull origin master
    else
        print_status "Cloning repository..."
        git clone https://github.com/mauljasmay/wifi-voucher-system.git $APP_DIR
        cd $APP_DIR
    fi
    
    print_success "Repository setup complete"
}

# Function to install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    cd $APP_DIR
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm install
    
    # Install Prisma CLI globally
    sudo npm install -g prisma
    
    print_success "Dependencies installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment configuration..."
    
    cd $APP_DIR
    
    # Create .env.production if it doesn't exist
    if [[ ! -f ".env.production" ]]; then
        print_status "Creating .env.production file..."
        
        # Generate secrets
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        
        cat > .env.production << EOF
# Database Configuration
DATABASE_URL="file:$APP_DIR/db/production.db"

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Application Settings
PORT=3000

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# MikroTik Configuration (configure via admin panel)
# MIKROTIK_HOST=192.168.88.1
# MIKROTIK_PORT=8728
# MIKROTIK_USERNAME=admin
# MIKROTIK_PASSWORD=
EOF
        
        print_success "Environment file created"
    else
        print_status "Environment file already exists"
    fi
    
    # Create database directory
    mkdir -p $APP_DIR/db
    chmod 755 $APP_DIR/db
    
    print_success "Environment setup complete"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    cd $APP_DIR
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    print_success "Database setup complete"
}

# Function to build application
build_application() {
    print_status "Building application..."
    
    cd $APP_DIR
    
    # Set production environment
    export NODE_ENV=production
    
    # Build application
    npm run build
    
    print_success "Application built successfully"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2 configuration..."
    
    cd $APP_DIR
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    log_file: '/var/log/pm2/$APP_NAME.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    
    # Create PM2 log directory
    sudo mkdir -p /var/log/pm2
    sudo chown -R $USER:$USER /var/log/pm2
    
    # Start application with PM2
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
    
    print_success "PM2 configuration complete"
}

# Function to setup Nginx
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Application Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static Files Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Rate Limiting
    location /api/ {
        proxy_pass http://localhost:3000;
        limit_req zone=api burst=20 nodelay;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_success "Nginx configuration complete"
}

# Function to setup SSL
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Setup auto-renewal
    sudo crontab -l | grep -q "certbot renew" || (sudo crontab -l; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
    
    print_success "SSL certificate setup complete"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP/HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow MikroTik API (optional)
    # sudo ufw allow 8728/tcp
    # sudo ufw allow 8729/tcp
    
    print_success "Firewall setup complete"
}

# Function to create admin user
create_admin_user() {
    print_status "Creating default admin user..."
    
    cd $APP_DIR
    
    # Create admin user script
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

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring script
    sudo tee /usr/local/bin/monitor-wifi-voucher.sh > /dev/null << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/wifi-voucher-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if application is running
if ! pm2 list | grep -q "wifi-voucher.*online"; then
    echo "[$DATE] ERROR: WiFi Voucher application is not running" >> $LOG_FILE
    pm2 restart wifi-voucher
    echo "[$DATE] INFO: Restarted WiFi Voucher application" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df /var/www/wifi-voucher | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

echo "[$DATE] INFO: Monitoring check completed" >> $LOG_FILE
EOF
    
    # Make monitoring script executable
    sudo chmod +x /usr/local/bin/monitor-wifi-voucher.sh
    
    # Setup monitoring cron job
    (crontab -l 2>/dev/null | grep -v "monitor-wifi-voucher"; echo "*/5 * * * * /usr/local/bin/monitor-wifi-voucher.sh") | crontab -
    
    # Create backup script
    sudo tee /usr/local/bin/backup-wifi-voucher.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/wifi-voucher"
DB_PATH="$APP_DIR/db/production.db"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
cp \$DB_PATH \$BACKUP_DIR/production_\$DATE.db

# Compress backup
gzip \$BACKUP_DIR/production_\$DATE.db

# Remove old backups (keep last 7 days)
find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Database backup completed: \$BACKUP_DIR/production_\$DATE.db.gz"
EOF
    
    # Make backup script executable
    sudo chmod +x /usr/local/bin/backup-wifi-voucher.sh
    
    # Setup backup cron job
    (crontab -l 2>/dev/null | grep -v "backup-wifi-voucher"; echo "0 2 * * * /usr/local/bin/backup-wifi-voucher.sh") | crontab -
    
    print_success "Monitoring setup complete"
}

# Function to display deployment summary
display_summary() {
    print_success "🎉 WiFi Voucher System deployment completed!"
    echo
    echo "=== Deployment Summary ==="
    echo "Application URL: https://$DOMAIN"
    echo "Admin Panel: https://$DOMAIN/admin"
    echo "Admin Email: admin@$DOMAIN"
    echo "Admin Password: admin123"
    echo
    echo "=== Important Information ==="
    echo "1. Please change the default admin password immediately"
    echo "2. Configure your MikroTik settings in the admin panel"
    echo "3. Setup your voucher packages and pricing"
    echo "4. Configure payment methods"
    echo
    echo "=== Useful Commands ==="
    echo "Check application status: pm2 status"
    echo "View logs: pm2 logs wifi-voucher"
    echo "Restart application: pm2 restart wifi-voucher"
    echo "Check Nginx status: sudo systemctl status nginx"
    echo "View deployment log: tail -f $LOG_FILE"
    echo
    echo "=== Security Notes ==="
    echo "1. SSL certificate is auto-renewed"
    echo "2. Firewall is configured and enabled"
    echo "3. Application runs in cluster mode"
    echo "4. Database backups are created daily"
    echo "5. Monitoring checks run every 5 minutes"
    echo
    print_success "Deployment completed successfully! 🚀"
}

# Main deployment function
main() {
    print_status "Starting WiFi Voucher System deployment..."
    log_message "Deployment started"
    
    # Check prerequisites
    check_root
    check_ubuntu
    
    # Update system
    update_system
    
    # Install dependencies
    install_nodejs
    install_packages
    install_pm2
    
    # Setup application
    setup_app_directory
    setup_repository
    install_dependencies
    setup_environment
    setup_database
    build_application
    
    # Setup services
    setup_pm2
    setup_nginx
    
    # Setup security and monitoring
    setup_ssl
    setup_firewall
    setup_monitoring
    
    # Create admin user
    create_admin_user
    
    # Display summary
    display_summary
    
    log_message "Deployment completed successfully"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"