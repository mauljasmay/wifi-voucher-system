# 🚀 Quick cPanel Deployment Guide

## 📋 Prerequisites
- cPanel hosting account with Node.js support
- SSH access to your cPanel account
- Domain name pointing to your hosting
- Git access (or ability to upload files)

## ⚡ Quick Deployment (5 Minutes)

### Step 1: SSH to Your cPanel Account
```bash
ssh username@yourdomain.com
```

### Step 2: Download and Run Deployment Script
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/mauljasmay/wifi-voucher-system/main/deploy-cpanel.sh

# Make it executable
chmod +x deploy-cpanel.sh

# Edit the script to set your domain
nano deploy-cpanel.sh
# Change: DOMAIN="yourdomain.com" to your actual domain

# Run the deployment
./deploy-cpanel.sh
```

### Step 3: Configure in cPanel
1. **Login to cPanel**
2. **Go to "Setup Node.js App"**
3. **Configure Application**:
   - Node.js Version: 20.x
   - Application Mode: Production
   - Application Root: `wifi-voucher`
   - Application URL: Select your domain
   - Application Startup File: `server.js`

### Step 4: Add Environment Variables
In cPanel Node.js Manager, add these environment variables:
```
NODE_ENV=production
DATABASE_URL=file:/home/username/wifi-voucher/db/production.db
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-from-script-output
JWT_SECRET=your-jwt-secret-from-script-output
ENCRYPTION_KEY=your-encryption-key-from-script-output
```

### Step 5: Start Application
Click **"Restart"** in cPanel Node.js Manager

## 🎯 Access Your System

- **Website**: `https://yourdomain.com`
- **Admin Panel**: `https://yourdomain.com/admin`
- **Default Login**: `admin@yourdomain.com` / `admin123`

## 🔧 Manual Setup (If Script Fails)

### 1. Create Application Directory
```bash
cd ~
mkdir wifi-voucher
cd wifi-voucher
```

### 2. Download Files
```bash
# Option A: Using Git
git clone https://github.com/mauljasmay/wifi-voucher-system.git .

# Option B: Download ZIP
wget https://github.com/mauljasmay/wifi-voucher-system/archive/main.zip
unzip main.zip
mv wifi-voucher-system-main/* .
rm -rf wifi-voucher-system-main main.zip
```

### 3. Setup cPanel Files
```bash
# Copy cPanel-specific package.json
cp package-cpanel-simple.json package.json

# Copy environment template
cp .env.cpanel .env

# Update paths in .env
sed -i 's|/home/username|'$HOME'|g' .env
sed -i 's|yourdomain.com|your-actual-domain.com|g' .env
```

### 4. Install Dependencies
```bash
npm install --production
npm install -g prisma
```

### 5. Setup Database
```bash
mkdir -p db logs
npx prisma generate
npx prisma db push
```

### 6. Build Application
```bash
npm run build
```

### 7. Create Admin User
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
bcrypt.hash('admin123', 10).then(hash => {
  return prisma.admin.create({
    data: {
      email: 'admin@yourdomain.com',
      password: hash,
      name: 'System Administrator',
      role: 'SUPER_ADMIN'
    }
  });
}).then(() => {
  console.log('Admin user created: admin@yourdomain.com / admin123');
  prisma.\$disconnect();
}).catch(console.error);
"
```

## 🔍 cPanel Configuration Details

### Node.js App Settings
- **Application Root**: `wifi-voucher`
- **Application URL**: Your domain/subdomain
- **Startup File**: `server.js`
- **Node.js Version**: 20.x (recommended)

### Required Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=file:/home/username/wifi-voucher/db/production.db
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-32-character-secret
JWT_SECRET=your-64-character-hex-secret
ENCRYPTION_KEY=your-32-character-hex-key
```

### SSL Certificate
1. Go to cPanel → SSL/TLS Status
2. Select your domain
3. Click "Run AutoSSL"

## 🛠️ Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs in cPanel Node.js Manager
# Or check application logs
tail -f ~/wifi-voucher/logs/app.log
```

#### Permission Denied
```bash
# Fix permissions
cd ~/wifi-voucher
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 .env
```

#### Database Error
```bash
# Regenerate Prisma client
cd ~/wifi-voucher
npx prisma generate
npx prisma db push
```

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000
# Restart application in cPanel Node.js Manager
```

### Error Messages & Solutions

#### "Module not found"
```bash
cd ~/wifi-voucher
npm install --production
```

#### "Database connection failed"
```bash
# Check database file exists
ls -la ~/wifi-voucher/db/production.db
# Regenerate database
npx prisma db push
```

#### "Permission denied" accessing .env
```bash
chmod 600 ~/wifi-voucher/.env
```

## 📊 File Structure After Installation

```
~/wifi-voucher/
├── server.js              # cPanel server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .htaccess              # Apache configuration
├── db/
│   └── production.db      # SQLite database
├── logs/
│   └── app.log           # Application logs
├── backups/              # Database backups
├── src/                  # Application source
├── public/               # Static files
└── .next/                # Next.js build output
```

## 🔄 Maintenance

### Update Application
```bash
cd ~/wifi-voucher
git pull origin master
npm install --production
npm run build
# Restart in cPanel Node.js Manager
```

### Backup Database
```bash
# Manual backup
cp ~/wifi-voucher/db/production.db ~/backups/production_$(date +%Y%m%d).db

# Automatic backup (already configured)
crontab -l | grep backup.sh
```

### View Logs
```bash
# Application logs
tail -f ~/wifi-voucher/logs/app.log

# cPanel logs
# cPanel → Metrics → Errors
```

## 🎉 Post-Installation Checklist

### ✅ System Configuration
- [ ] Change default admin password
- [ ] Configure MikroTik router settings
- [ ] Setup voucher packages
- [ ] Configure payment methods
- [ ] Test MikroTik connection
- [ ] Test voucher creation
- [ ] Test payment flow

### ✅ Security
- [ ] SSL certificate installed
- [ ] Admin password changed
- [ ] Environment variables secured
- [ ] File permissions correct
- [ ] Backup system working

### ✅ Performance
- [ ] Application loading quickly
- [ ] Database queries optimized
- [ ] Static files cached
- [ ] Error monitoring setup

## 📞 Support

### Getting Help
- **cPanel Support**: Contact your hosting provider
- **Application Issues**: GitHub repository issues
- **MikroTik Issues**: Router documentation

### Useful Commands
```bash
# Application directory
cd ~/wifi-voucher

# Check application status
ps aux | grep node

# View database
npx prisma studio

# Restart application
# Use cPanel Node.js Manager

# Check logs
tail -f logs/app.log
```

## 🚀 Ready to Go!

Your WiFi Voucher System is now running on cPanel! 

### Next Steps:
1. 🎯 Access admin panel and configure settings
2. 🌐 Connect your MikroTik router
3. 💳 Setup payment methods
4. 🎫 Create voucher packages
5. 🧪 Test the complete system

🎉 **Your WiFi Voucher System is ready for production on cPanel!**