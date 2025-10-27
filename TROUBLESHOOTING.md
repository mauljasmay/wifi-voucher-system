# 🔧 WiFi Voucher System - Troubleshooting Guide

## 📋 Common Installation Errors

### 🚨 Error: Unknown system error -122

#### Problem Description
```
npm error code Unknown system error -122
npm error syscall write
npm error errno Unknown system error -122
npm error Invalid response body while trying to fetch https://registry.npmjs.org/@tailwindcss%2fpostcss
```

#### Root Causes
- **Network connectivity issues**
- **Filesystem permission problems**
- **Disk space limitations**
- **npm cache corruption**
- **cPanel resource limits**

#### Solutions

##### Solution 1: Clear npm Cache
```bash
# Clear npm cache completely
npm cache clean --force

# Verify cache is cleared
npm cache verify

# Try installation again
npm install --production
```

##### Solution 2: Use Different Registry
```bash
# Use npm registry mirror
npm config set registry https://registry.npmjs.org/

# Or use yarn registry
npm config set registry https://registry.yarnpkg.com/

# Try installation
npm install --production
```

##### Solution 3: Increase npm Timeout
```bash
# Set longer timeout
npm config set fetch-timeout 600000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Try installation
npm install --production
```

##### Solution 4: Use Minimal Package.json
```bash
# Use our minimal package for cPanel
cp package-cpanel-minimal.json package.json
npm install --production
```

##### Solution 5: Install with Specific Options
```bash
# Install with no-audit and no-fund
npm install --production --no-audit --no-fund

# Or with verbose output for debugging
npm install --production --verbose
```

##### Solution 6: Check Disk Space and Permissions
```bash
# Check disk space
df -h

# Check npm cache directory
ls -la ~/.npm/

# Clear and recreate npm cache
rm -rf ~/.npm/
mkdir ~/.npm
chmod 755 ~/.npm
```

##### Solution 7: Use Yarn Alternative
```bash
# Install yarn globally
npm install -g yarn

# Use yarn to install
yarn install --production

# Or use yarn with specific registry
yarn config set registry https://registry.npmjs.org/
yarn install --production
```

---

## 🔧 cPanel Specific Solutions

### Solution 1: Use cPanel Terminal
```bash
# Access cPanel Terminal instead of SSH
# In cPanel -> Terminal -> run commands
```

### Solution 2: Limit Concurrent Connections
```bash
# Limit npm concurrent connections
npm config set maxsockets 1
npm config set fetch-retries 3
npm install --production
```

### Solution 3: Use Staged Installation
```bash
# Install core dependencies first
npm install next react react-dom

# Then install others
npm install @prisma/client prisma
npm install bcryptjs jsonwebtoken
npm install node-routeros axios
npm install qrcode z-ai-web-dev-sdk
```

### Solution 4: Disable Optional Dependencies
```bash
# Install without optional dependencies
npm install --production --no-optional
```

---

## 📦 Minimal Package.json for Troubleshooting

Create `package-cpanel-minimal.json`:

```json
{
  "name": "wifi-voucher-system-minimal",
  "version": "1.0.0",
  "description": "WiFi Voucher System - Minimal Version",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "build": "next build",
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^5.16.2",
    "prisma": "^5.16.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "node-routeros": "^1.6.9",
    "axios": "^1.6.8",
    "qrcode": "^1.5.3",
    "z-ai-web-dev-sdk": "^0.0.10"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## 🌐 Network Solutions

### Solution 1: Check Network Connectivity
```bash
# Test npm registry connectivity
curl -I https://registry.npmjs.org/

# Test with specific package
curl -I https://registry.npmjs.org/next

# Ping registry
ping registry.npmjs.org
```

### Solution 2: Use VPN or Different Network
- Try switching to different network
- Use VPN if available
- Contact hosting provider about network issues

### Solution 3: Configure npm Proxy
```bash
# If behind proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or clear proxy settings
npm config delete proxy
npm config delete https-proxy
```

---

## 💾 cPanel Resource Limits

### Check Resource Usage
```bash
# Check current processes
ps aux

# Check memory usage
free -h

# Check disk usage
df -h

# Check cPanel limits
# In cPanel -> Metrics -> Resource Usage
```

### Optimize for cPanel
```bash
# Use minimal installation
cp package-cpanel-minimal.json package.json

# Install with reduced concurrency
npm install --production --maxsockets=1

# Clear cache after installation
npm cache clean --force
```

---

## 🔄 Alternative Installation Methods

### Method 1: Pre-compiled Dependencies
```bash
# Download pre-compiled node_modules (if available)
wget https://github.com/mauljasmay/wifi-voucher-system/releases/download/v1.0/node_modules.tar.gz

# Extract
tar -xzf node_modules.tar.gz

# Test installation
npm start
```

### Method 2: Step-by-Step Installation
```bash
# Install dependencies one by one
npm install next@14.2.5
npm install react@18.3.1
npm install react-dom@18.3.1
npm install @prisma/client@5.16.2
npm install prisma@5.16.2
# ... continue with other packages
```

### Method 3: Use Docker (if available)
```bash
# Create Dockerfile for cPanel compatibility
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Getting Help

### Debug Information Collection
```bash
# Create debug report
echo "=== System Information ===" > debug-report.txt
echo "Date: $(date)" >> debug-report.txt
echo "Node.js: $(node --version)" >> debug-report.txt
echo "npm: $(npm --version)" >> debug-report.txt
echo "OS: $(uname -a)" >> debug-report.txt
echo "Disk: $(df -h)" >> debug-report.txt
echo "Memory: $(free -h)" >> debug-report.txt
echo "" >> debug-report.txt

echo "=== npm Configuration ===" >> debug-report.txt
npm config list >> debug-report.txt
echo "" >> debug-report.txt

echo "=== Network Test ===" >> debug-report.txt
curl -I https://registry.npmjs.org/ >> debug-report.txt 2>&1
echo "" >> debug-report.txt

echo "=== Error Log ===" >> debug-report.txt
tail -20 ~/.npm/_logs/*.log >> debug-report.txt 2>&1

# Share debug-report.txt for support
```

### Support Channels
- **cPanel Support**: Contact your hosting provider
- **GitHub Issues**: Create issue in repository
- **Community Forums**: Stack Overflow, Reddit
- **Documentation**: Check README and guides

---

## 🎯 Quick Fix Checklist

### Before Installation
- [ ] Check disk space (minimum 2GB free)
- [ ] Verify network connectivity
- [ ] Clear npm cache
- [ ] Use appropriate package.json

### During Installation
- [ ] Use `--production` flag
- [ ] Add `--no-audit --no-fund` flags
- [ ] Limit concurrent connections
- [ ] Monitor resource usage

### After Installation
- [ ] Verify all dependencies installed
- [ ] Test application startup
- [ ] Check database connection
- [ ] Validate MikroTik integration

---

## 🚀 Emergency Recovery

### If All Else Fails
```bash
# Reset to clean state
rm -rf node_modules package-lock.json
npm cache clean --force

# Use minimal configuration
cp package-cpanel-minimal.json package.json

# Try installation with minimal options
npm install --production --no-audit --no-fund --maxsockets=1

# If still fails, contact support with debug report
./create-debug-report.sh
```

### Manual Package Installation
```bash
# Download packages manually
mkdir -p node_modules

# Download each package tarball
npm pack next@14.2.5
tar -xzf next-*.tgz
mv package node_modules/next

# Repeat for other essential packages
```

---

## 📈 Prevention Tips

### Best Practices
1. **Regular Maintenance**: Clear npm cache weekly
2. **Monitor Resources**: Check disk space and memory usage
3. **Update Dependencies**: Keep packages updated
4. **Backup Configuration**: Save working package.json
5. **Network Stability**: Use reliable internet connection

### cPanel Optimization
1. **Resource Limits**: Monitor cPanel resource usage
2. **Scheduled Tasks**: Run installations during off-peak hours
3. **Backup Strategy**: Regular database and file backups
4. **Security**: Keep system updated and secure

---

## 🎉 Success Verification

### Test Installation
```bash
# Check if all dependencies installed
npm list --depth=0

# Test application build
npm run build

# Test application start
npm start

# Check application health
curl http://localhost:3000/api/health
```

### Expected Results
- ✅ All 50+ core dependencies installed
- ✅ Application builds without errors
- ✅ Server starts successfully
- ✅ Database connection works
- ✅ Admin panel accessible

🎯 **Follow this guide to resolve installation issues and get your WiFi Voucher System running!**