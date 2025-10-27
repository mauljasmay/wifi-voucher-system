# 🚀 WiFi Voucher System - cPanel Node.js Installation Guide

## 📋 Prerequisites

### cPanel Requirements
- **cPanel Version**: 108 or later
- **Node.js Manager**: Available in cPanel
- **SQLite3**: Supported on hosting account
- **SSH Access**: Required for initial setup
- **Domain**: Pointing to cPanel account

### Hosting Requirements
- **Storage**: Minimum 5GB
- **RAM**: Minimum 2GB guaranteed
- **Bandwidth**: Unlimited or high bandwidth
- **SSH Access**: Enabled for your account
- **Cron Jobs**: Available for scheduled tasks

---

## 🛠️ Step 1: cPanel Node.js Setup

### Enable Node.js in cPanel
1. **Login to cPanel**
2. **Go to "Setup Node.js App"** (usually in Software section)
3. **Click "Create Application"**
4. **Configure Node.js Application**:
   - **Node.js Version**: 20.x (recommended)
   - **Application Mode**: Production
   - **Application Root**: `wifi-voucher`
   - **Application URL**: Select your domain
   - **Application Startup File**: `server.js`

### Install Node.js Dependencies
1. **Open cPanel Terminal** or **SSH** to your account
2. **Navigate to application directory**:
   ```bash
   cd ~/wifi-voucher
   ```

3. **Clone the repository**:
   ```bash
   git clone https://github.com/mauljasmay/wifi-voucher-system.git .
   ```

4. **Install dependencies**:
   ```bash
   npm install --production
   ```

---

## 🔧 Step 2: Application Configuration

### Create cPanel-Compatible Server File
Create `server.js` in your application root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### Update package.json for cPanel
Modify your `package.json` to include cPanel-specific configurations (use `package-cpanel-simple.json` as reference):

```json
{
  "name": "wifi-voucher-system",
  "version": "1.0.0",
  "description": "WiFi Voucher System with MikroTik Integration",
  "main": "server.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "node-routeros": "^2.0.0",
    "axios": "^1.0.0",
    "qrcode": "^1.5.0",
    "canvas": "^2.11.0",
    "z-ai-web-dev-sdk": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## 🗄️ Step 3: Database Setup

### Configure SQLite for cPanel
1. **Create database directory**:
   ```bash
   mkdir -p ~/wifi-voucher/db
   chmod 755 ~/wifi-voucher/db
   ```

2. **Update Prisma schema** for cPanel paths:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Create environment file**:
   ```bash
   nano .env
   ```

   ```env
   # Database Configuration
   DATABASE_URL="file:/home/username/wifi-voucher/db/production.db"
   
   # Next.js Configuration
   NODE_ENV=production
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-super-secret-key-here
   
   # Application Settings
   PORT=3000
   
   # Security
   JWT_SECRET=your-jwt-secret-key-here
   ENCRYPTION_KEY=your-32-character-encryption-key
   ```

4. **Generate Prisma client**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## 🌐 Step 4: cPanel Application Configuration

### Configure Application in cPanel
1. **Go back to cPanel → Setup Node.js App**
2. **Edit your application**:
   - **Application Root**: `wifi-voucher`
   - **Application URL**: Select your domain/subdomain
   - **Application Startup File**: `server.js`
   - **Environment Variables**: Add your `.env` variables

3. **Add Environment Variables** in cPanel:
   ```
   NODE_ENV=production
   DATABASE_URL=file:/home/username/wifi-voucher/db/production.db
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-secret-key
   JWT_SECRET=your-jwt-secret
   ENCRYPTION_KEY=your-encryption-key
   ```

### Restart Application
1. **Click "Restart"** in cPanel Node.js Manager
2. **Check application logs** for any errors
3. **Test your application** by visiting the domain

---

## 🔒 Step 5: SSL Certificate Setup

### Enable SSL in cPanel
1. **Go to cPanel → SSL/TLS Status**
2. **Select your domain**
3. **Click "Run AutoSSL"**
4. **Wait for certificate installation**

### Force HTTPS Redirect
Add this to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Forwarded-Proto',
            value: 'https',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 📁 Step 6: File Permissions

### Set Correct Permissions
```bash
# Set proper permissions for cPanel
find ~/wifi-voucher -type d -exec chmod 755 {} \;
find ~/wifi-voucher -type f -exec chmod 644 {} \;
chmod 600 ~/wifi-voucher/.env
chmod 755 ~/wifi-voucher/db
chmod 644 ~/wifi-voucher/db/production.db
```

### Create .htaccess for Static Files
Create `.htaccess` in your application root:

```apache
# Handle Next.js static files
RewriteEngine On
RewriteBase /

# Redirect to Node.js app for non-static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Serve static files directly
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
    ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

---

## ⚡ Step 7: Performance Optimization

### Enable Caching
Add caching headers to your application:

```javascript
// In your Next.js pages or API routes
export async function getServerSideProps({ res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=31536000, max-age=31536000, stale-while-revalidate'
  );
  return {
    props: {},
  };
}
```

### Optimize Images
Add image optimization to `next.config.js`:

```javascript
const nextConfig = {
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // ... other config
};
```

---

## 🔄 Step 8: Cron Jobs Setup

### Database Backup Cron Job
1. **Go to cPanel → Cron Jobs**
2. **Add New Cron Job**:
   - **Minute**: 0
   - **Hour**: 2
   - **Day**: *
   - **Month**: *
   - **Weekday**: *
   - **Command**: 
     ```bash
     /bin/cp /home/username/wifi-voucher/db/production.db /home/username/backups/production_$(date +\%Y\%m\%d_\%H\%M\%S).db
     ```

### Log Rotation Cron Job
```bash
# Clean old logs (keep last 7 days)
/usr/bin/find /home/username/wifi-voucher/.next -name "*.log" -mtime +7 -delete
```

---

## 📊 Step 9: Monitoring & Logging

### Enable Application Logging
Update your `server.js` to include logging:

```javascript
const fs = require('fs');
const path = require('path');

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(path.join(logsDir, 'app.log'), logMessage);
  console.log(message);
}

// Modify server to include logging
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      log(`${req.method} ${req.url}`);
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      log(`Error: ${err.message}`);
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    log(`Server started on port ${port}`);
  });
});
```

### Monitor Application Health
Create health check endpoint in `pages/api/health.js`:

```javascript
export default function handler(req, res) {
  try {
    // Check database connection
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    prisma.$connect()
      .then(() => {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'connected',
          memory: process.memoryUsage(),
          uptime: process.uptime()
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: 'unhealthy',
          error: 'Database connection failed',
          timestamp: new Date().toISOString()
        });
      })
      .finally(() => {
        prisma.$disconnect();
      });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 🛡️ Step 10: Security Configuration

### Environment Security
1. **Protect sensitive files**:
   ```bash
   chmod 600 .env
   chmod 600 db/production.db
   ```

2. **Create .htaccess for security**:
   ```apache
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
   
   # Prevent directory listing
   Options -Indexes
   ```

### Rate Limiting
Add rate limiting to your API routes:

```javascript
// Create middleware for rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Apply to API routes
app.use('/api/', limiter);
```

---

## 🚀 Step 11: Deployment & Testing

### Final Deployment Steps
1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Restart in cPanel**:
   - Go to cPanel → Setup Node.js App
   - Click "Restart" for your application

3. **Test the application**:
   - Visit your domain
   - Check all pages load correctly
   - Test admin panel functionality
   - Verify MikroTik integration

### Create Admin User
```bash
# Create admin user script
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@yourdomain.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Admin created:', admin.email);
  console.log('Password: admin123');
}

createAdmin().catch(console.error);
"
```

---

## 🔧 Troubleshooting

### Common cPanel Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 2. Permission Denied
```bash
# Fix permissions
find ~/wifi-voucher -type d -exec chmod 755 {} \;
find ~/wifi-voucher -type f -exec chmod 644 {} \;
```

#### 3. Database Connection Error
```bash
# Check database file
ls -la ~/wifi-voucher/db/production.db

# Regenerate Prisma client
npx prisma generate
npx prisma db push
```

#### 4. Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --production
```

#### 5. Application Not Starting
```bash
# Check cPanel Node.js logs
# In cPanel → Setup Node.js App → View Logs

# Check application logs
tail -f ~/wifi-voucher/logs/app.log
```

### Performance Issues

#### 1. Slow Response Times
- Enable caching headers
- Optimize images
- Use CDN for static assets
- Enable gzip compression

#### 2. Memory Issues
- Monitor memory usage in cPanel
- Restart application periodically
- Optimize database queries
- Use connection pooling

---

## 📱 Step 12: Post-Installation Configuration

### Access Admin Panel
1. **URL**: `https://yourdomain.com/admin`
2. **Default Login**:
   - Email: `admin@yourdomain.com`
   - Password: `admin123`

### Configure MikroTik
1. **Go to Admin Panel → MikroTik Settings**
2. **Add your router configuration**:
   - Host: MikroTik IP address
   - Username: Router admin username
   - Password: Router admin password
   - Port: 8728 (v6) or 443 (v7)
3. **Test connection**
4. **Configure hotspot profiles**

### Setup Vouchers
1. **Go to Voucher Management**
2. **Create voucher packages**
3. **Set pricing and duration**
4. **Configure MikroTik profiles**
5. **Enable auto-creation if needed**

### Payment Configuration
1. **Go to Payment Settings**
2. **Configure QRIS payment**
3. **Setup bank transfer details**
4. **Enable e-wallet options**
5. **Test payment flow**

---

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Check application logs and performance
2. **Monthly**: Update Node.js dependencies
3. **Quarterly**: Review security settings
4. **Yearly**: Plan for major updates

### Backup Strategy
- **Database**: Daily automated backups
- **Files**: Weekly full backups
- **Configuration**: Version control with Git

### Monitoring
- **Application Health**: `/api/health` endpoint
- **Resource Usage**: cPanel Resource Usage
- **Error Logs**: Application logs in cPanel
- **Performance**: Page load times

---

## 🎉 Installation Complete!

Your WiFi Voucher System is now running on cPanel with Node.js!

### ✅ **What's Installed**
- **Next.js Application**: Running on Node.js 20.x
- **Database**: SQLite with Prisma ORM
- **Admin Panel**: Complete management interface
- **MikroTik Integration**: Full router management
- **SSL Certificate**: Auto-configured
- **Security**: Rate limiting and access controls
- **Monitoring**: Health checks and logging

### 🚀 **Next Steps**
1. **Change default admin password**
2. **Configure your MikroTik router**
3. **Setup voucher packages**
4. **Configure payment methods**
5. **Test complete system**

### 📞 **Support**
- **cPanel Documentation**: Your hosting provider
- **Application Issues**: GitHub repository
- **MikroTik Support**: Router documentation

🎯 **Your WiFi Voucher System is ready for production on cPanel!**