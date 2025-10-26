# 🚀 Quick Deployment Guide - Ubuntu 22

## 📋 Prerequisites
- Ubuntu 22.04 LTS server
- Domain name pointing to server IP
- SSH access with sudo privileges

## ⚡ One-Click Deployment

### Step 1: Download Deployment Script
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/mauljasmay/wifi-voucher-system/main/deploy.sh

# Make it executable
chmod +x deploy.sh
```

### Step 2: Configure Your Domain
```bash
# Edit the deployment script to set your domain
nano deploy.sh

# Change this line (around line 20):
DOMAIN="your-domain.com" # Change this to your actual domain
```

### Step 3: Run Deployment
```bash
# Run the deployment script
./deploy.sh
```

## 🎯 What the Script Does

### 📦 Package Installation
- Node.js 20.x
- npm & PM2
- Nginx web server
- Certbot for SSL
- Git & build tools

### 🗄️ Database Setup
- SQLite database configuration
- Prisma client generation
- Database schema migration

### 🌐 Web Server Configuration
- Nginx reverse proxy setup
- SSL certificate installation
- Security headers configuration
- Rate limiting setup

### 🔧 Application Setup
- Clone repository from GitHub
- Install Node.js dependencies
- Build production application
- PM2 process management
- Auto-start configuration

### 🛡️ Security & Monitoring
- UFW firewall configuration
- SSL auto-renewal
- Application monitoring
- Database backup automation
- Log rotation setup

### 👤 Admin Account
- Creates default admin user
- Email: `admin@your-domain.com`
- Password: `admin123`
- **Important**: Change password after first login

## 📱 Post-Deployment Configuration

### 1. Access Admin Panel
```
https://your-domain.com/admin
```

### 2. Configure MikroTik
- Go to MikroTik Settings in admin panel
- Add your router IP and credentials
- Test connection
- Configure hotspot profiles

### 3. Setup Vouchers
- Create voucher packages
- Set pricing and duration
- Configure MikroTik profiles
- Enable auto-creation if needed

### 4. Payment Configuration
- Setup QRIS payment
- Configure bank transfer
- Enable e-wallet options
- Test payment flow

## 🔍 Manual Installation Steps

If you prefer manual installation, follow these steps:

### 1. System Update
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install PM2
```bash
sudo npm install -g pm2
```

### 4. Clone Repository
```bash
sudo mkdir -p /var/www/wifi-voucher
cd /var/www/wifi-voucher
git clone https://github.com/mauljasmay/wifi-voucher-system.git .
sudo chown -R $USER:$USER /var/www/wifi-voucher
```

### 5. Install Dependencies
```bash
npm install
npm install -g prisma
npx prisma generate
npx prisma db push
```

### 6. Environment Setup
```bash
cp .env.example .env.production
nano .env.production
```

### 7. Build Application
```bash
npm run build
```

### 8. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 9. Setup Nginx
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/wifi-voucher
# (Use configuration from INSTALL_UBUNTU.md)
sudo certbot --nginx -d your-domain.com
```

## 🔧 Troubleshooting

### Common Issues

#### Port 3000 Already in Use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

#### Permission Issues
```bash
sudo chown -R $USER:$USER /var/www/wifi-voucher
chmod -R 755 /var/www/wifi-voucher
```

#### PM2 Issues
```bash
pm2 delete wifi-voucher
pm2 start ecosystem.config.js --env production
```

#### Nginx Issues
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Log Locations
- Application logs: `/var/log/pm2/wifi-voucher.log`
- Nginx logs: `/var/log/nginx/`
- Deployment log: `/var/log/wifi-voucher-deploy.log`
- Monitoring log: `/var/log/wifi-voucher-monitor.log`

## 📊 Monitoring Commands

### Check Application Status
```bash
pm2 status
pm2 logs wifi-voucher
```

### Check System Resources
```bash
htop
df -h
free -h
```

### Check Services
```bash
sudo systemctl status nginx
sudo ufw status
```

## 🔄 Maintenance

### Update Application
```bash
cd /var/www/wifi-voucher
git pull origin master
npm install
npm run build
pm2 restart wifi-voucher
```

### Backup Database
```bash
cp /var/www/wifi-voucher/db/production.db /var/backups/wifi-voucher/production_$(date +%Y%m%d).db
```

### Renew SSL
```bash
sudo certbot renew
```

## 🎉 Success!

Your WiFi Voucher System is now running on Ubuntu 22!

### Next Steps:
1. ✅ Access admin panel at `https://your-domain.com/admin`
2. ✅ Login with admin credentials
3. ✅ Configure MikroTik router
4. ✅ Setup voucher packages
5. ✅ Configure payment methods
6. ✅ Test complete system

### Support:
- 📧 Email: admin@your-domain.com
- 📚 Documentation: Check `INSTALL_UBUNTU.md`
- 🐛 Issues: GitHub repository issues

🚀 **Your WiFi Voucher System is ready for production!**