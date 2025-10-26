# 🚀 WiFi Voucher System - Ubuntu 22 Installation Guide

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 22.04 LTS or later
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **Network**: Internet connection for package installation

### Required Software
- Node.js 18+ (Recommended 20.x)
- npm or yarn
- SQLite3 (built-in)
- Git
- Nginx (for reverse proxy)
- PM2 (process manager)

---

## 🛠️ Step 1: System Preparation

### Update System Packages
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common \
    build-essential python3 python3-pip
```

### Install Node.js 20.x
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify PM2 installation
pm2 --version
```

---

## 📁 Step 2: Application Setup

### Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www/wifi-voucher
cd /var/www/wifi-voucher

# Clone your repository
git clone https://github.com/mauljasmay/wifi-voucher-system.git .

# Set proper permissions
sudo chown -R $USER:$USER /var/www/wifi-voucher
chmod -R 755 /var/www/wifi-voucher
```

### Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Prisma CLI globally
sudo npm install -g prisma

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

---

## 🔧 Step 3: Environment Configuration

### Create Production Environment File
```bash
# Copy environment template
cp .env.example .env.production

# Edit production environment
nano .env.production
```

### Environment Configuration (.env.production)
```env
# Database Configuration
DATABASE_URL="file:/var/www/wifi-voucher/db/production.db"

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# Application Settings
PORT=3000

# MikroTik Configuration (Optional - can be configured via admin panel)
MIKROTIK_HOST=192.168.88.1
MIKROTIK_PORT=8728
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=your-mikrotik-password

# Security
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Generate Security Keys
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -hex 32

# Generate encryption key
openssl rand -hex 16
```

---

## 🗄️ Step 4: Database Setup

### Create Production Database
```bash
# Create database directory
sudo mkdir -p /var/www/wifi-voucher/db

# Set database permissions
sudo chown -R $USER:$USER /var/www/wifi-voucher/db
chmod 755 /var/www/wifi-voucher/db

# Initialize database
npx prisma db push

# (Optional) Seed initial data
# npx prisma db seed
```

### Database Backup Script
```bash
# Create backup script
sudo nano /usr/local/bin/backup-wifi-voucher.sh
```

```bash
#!/bin/bash
# Backup WiFi Voucher Database

BACKUP_DIR="/var/backups/wifi-voucher"
DB_PATH="/var/www/wifi-voucher/db/production.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp $DB_PATH $BACKUP_DIR/production_$DATE.db

# Compress backup
gzip $BACKUP_DIR/production_$DATE.db

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/production_$DATE.db.gz"
```

```bash
# Make backup script executable
sudo chmod +x /usr/local/bin/backup-wifi-voucher.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-wifi-voucher.sh") | crontab -
```

---

## 🌐 Step 5: Nginx Reverse Proxy Setup

### Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Create Nginx Configuration
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/wifi-voucher
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
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

# Rate Limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

### Enable SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Enable site
sudo ln -s /etc/nginx/sites-available/wifi-voucher /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## ⚡ Step 6: PM2 Process Management

### Create PM2 Configuration File
```bash
# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'wifi-voucher',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/wifi-voucher',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Performance
    instances: 'max',
    exec_mode: 'cluster',
    // Monitoring
    watch: false,
    max_memory_restart: '1G',
    // Logging
    log_file: '/var/log/pm2/wifi-voucher.log',
    out_file: '/var/log/pm2/wifi-voucher-out.log',
    error_file: '/var/log/pm2/wifi-voucher-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Auto restart
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### Setup PM2 Logging
```bash
# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

---

## 🔥 Step 7: Firewall Configuration

### Setup UFW Firewall
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow MikroTik API (if needed)
sudo ufw allow 8728/tcp
sudo ufw allow 8729/tcp

# Check firewall status
sudo ufw status verbose
```

---

## 📊 Step 8: Monitoring & Maintenance

### System Monitoring Script
```bash
# Create monitoring script
sudo nano /usr/local/bin/monitor-wifi-voucher.sh
```

```bash
#!/bin/bash
# WiFi Voucher System Monitoring

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

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEM_USAGE}%" >> $LOG_FILE
fi

# Check database file
if [ ! -f "/var/www/wifi-voucher/db/production.db" ]; then
    echo "[$DATE] ERROR: Database file not found" >> $LOG_FILE
fi

echo "[$DATE] INFO: Monitoring check completed" >> $LOG_FILE
```

```bash
# Make monitoring script executable
sudo chmod +x /usr/local/bin/monitor-wifi-voucher.sh

# Setup monitoring cron job (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-wifi-voucher.sh") | crontab -
```

### Log Rotation Setup
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/wifi-voucher
```

```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/wifi-voucher-monitor.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
```

---

## 🚀 Step 9: Final Setup & Testing

### Build Application
```bash
# Build for production
npm run build

# Test application locally
npm start
```

### Start Production Services
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Check PM2 status
pm2 status
pm2 logs wifi-voucher

# Check Nginx status
sudo systemctl status nginx

# Check application URL
curl -I http://localhost:3000
```

### Verify Installation
```bash
# Test database connection
npx prisma db pull

# Test MikroTik connection (if configured)
curl -X POST http://localhost:3000/api/mikrotik/test \
  -H "Content-Type: application/json" \
  -d '{"host":"192.168.88.1","username":"admin","password":"your-password"}'

# Check application health
curl http://localhost:3000/api/health
```

---

## 📱 Step 10: Admin Configuration

### Access Admin Panel
1. Open browser: `https://your-domain.com/admin`
2. Default admin credentials (check database or create new admin)
3. Configure MikroTik settings in admin panel
4. Setup voucher packages and pricing
5. Configure payment methods

### Create First Admin User
```bash
# Create admin user via script
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Admin created:', admin);
}

createAdmin().catch(console.error);
"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### 2. Database Permission Issues
```bash
# Fix database permissions
sudo chown -R $USER:$USER /var/www/wifi-voucher/db
chmod 755 /var/www/wifi-voucher/db
chmod 644 /var/www/wifi-voucher/db/production.db
```

#### 3. PM2 Issues
```bash
# Restart PM2
pm2 restart wifi-voucher

# Reset PM2
pm2 delete wifi-voucher
pm2 start ecosystem.config.js --env production

# Check PM2 logs
pm2 logs wifi-voucher --lines 50
```

#### 4. Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Performance Optimization

#### 1. Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### 2. Enable Browser Caching
Add to Nginx configuration:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Database Optimization
```bash
# Vacuum SQLite database
sqlite3 /var/www/wifi-voucher/db/production.db "VACUUM;"

# Analyze database for query optimization
sqlite3 /var/www/wifi-voucher/db/production.db "ANALYZE;"
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check logs and monitor system performance
2. **Monthly**: Update Node.js packages and system packages
3. **Quarterly**: Review security updates and backup strategy
4. **Yearly**: Plan for major version upgrades

### Backup Strategy
- **Database**: Daily automated backups with 7-day retention
- **Configuration**: Git repository for all configuration files
- **SSL Certificates**: Let's Encrypt auto-renewal
- **Application**: PM2 process monitoring and auto-restart

### Security Best Practices
1. Regular security updates: `sudo apt update && sudo apt upgrade`
2. Monitor access logs: `sudo tail -f /var/log/nginx/access.log`
3. Use strong passwords and SSH keys
4. Enable fail2ban for brute force protection
5. Regular security audits and penetration testing

---

## 🎉 Installation Complete!

Your WiFi Voucher System with MikroTik integration is now running on Ubuntu 22!

### Next Steps:
1. Access your admin panel at `https://your-domain.com/admin`
2. Configure MikroTik router settings
3. Setup voucher packages and pricing
4. Configure payment methods
5. Test the complete system

### Quick Commands:
```bash
# Check application status
pm2 status

# View logs
pm2 logs wifi-voucher

# Restart application
pm2 restart wifi-voucher

# Check Nginx status
sudo systemctl status nginx

# View system resources
htop
```

🚀 **Your WiFi Voucher System is now ready for production!**