# Integrasi MikroTik RouterOS v6 & v7

## 📋 Overview

Sistem ini mendukung integrasi penuh dengan MikroTik RouterOS v6 dan v7 untuk pembuatan voucher hotspot otomatis. Integrasi memungkinkan pembuatan user hotspot, manajemen profile, dan monitoring real-time langsung dari dashboard admin.

## 🚀 Fitur Utama

### **1. Koneksi Multi-Versi**
- **RouterOS v6**: Support API legacy port 8728
- **RouterOS v7**: Support REST API dan fallback ke API legacy
- **Auto-detection**: Deteksi otomatis tipe koneksi yang tersedia

### **2. Manajemen Voucher Otomatis**
- Pembuatan user hotspot otomatis saat transaksi
- Generate username & password random
- Konfigurasi time limit dan data limit
- Assign ke profile hotspot tertentu

### **3. Monitoring Real-Time**
- Daftar user aktif/idle
- Statistik penggunaan data
- Monitoring uptime per user
- Filter dan search user

### **4. Profile Management**
- Sync profile dari MikroTik
- Assign profile ke voucher
- Rate limit management

## 🛠️ Konfigurasi MikroTik

### **Persyaratan RouterOS**

#### **1. Enable API Service**
```bash
# Via WinBox/WebFig
IP -> Services -> API
- Check "API" port (default: 8728)
- Set allowed IP addresses (0.0.0.0/0 for all)
- Apply

# Via CLI
/ip service enable api
/ip service set api port=8728 address=0.0.0.0/0
```

#### **2. Setup Hotspot**
```bash
# Basic Hotspot Setup
/ip hotspot setup
# Follow wizard prompts or use manual configuration

# Manual Setup Example
/ip hotspot add name=hotspot1 interface=ether1 address-pool=hs-pool1 profile=hsprof1
/ip hotspot profile add name=hsprof1 auth-type=chap,http-pap hotspot-address=192.168.1.1
```

#### **3. Create User Profiles**
```bash
# Create profiles for different voucher types
/ip hotspot user profile add name=1hour shared-users=1 uptime-limit=1h
/ip hotspot user profile add name=1day shared-users=1 uptime-limit=1d
/ip hotspot user profile add name=1GB shared-users=1 limit-bytes-total=1G
```

### **User API Configuration**
```bash
# Create API user with limited privileges
/user add name=apiuser group=full password=securepassword
# OR create specific group for API access
/user group add name=api-group policy=api,read,write,password
/user add name=apiuser group=api-group password=securepassword
```

## 📱 Setup di MLJ-NET

### **1. Tambah MikroTik Settings**
1. Login ke admin dashboard
2. Menuju `MikroTik Management`
3. Klik `Tambah MikroTik`
4. Isi konfigurasi:
   - **Nama**: Nama identifikasi router
   - **Host/IP**: IP address MikroTik
   - **Port**: 8728 (default API port)
   - **Username**: User API MikroTik
   - **Password**: Password API user
   - **Versi**: v6 atau v7
   - **Interface**: Interface hotspot (ether1, wlan1, dll)
   - **Default Profile**: Profile default untuk voucher

### **2. Test Koneksi**
- Klik tombol `Test` untuk verifikasi koneksi
- System akan menampilkan status koneksi dan available profiles
- Error message akan ditampilkan jika koneksi gagal

### **3. Konfigurasi Voucher**
Edit voucher dan enable MikroTik integration:
- **MikroTik Profile**: Pilih profile hotspot
- **Time Limit**: Durasi koneksi (1h, 1d, 1w)
- **Data Limit**: Kuota data (1GB, 500MB)
- **Auto Create**: Otomatis buat user di MikroTik
- **Sync with MikroTik**: Sinkronisasi data

## 🔧 API Endpoints

### **Settings Management**
```
GET    /api/mikrotik/settings     - Get all MikroTik settings
POST   /api/mikrotik/settings     - Create new settings
POST   /api/mikrotik/test         - Test connection
```

### **User Management**
```
GET    /api/mikrotik/users        - Get users (filter: active=true, profile=name)
DELETE /api/mikrotik/users        - Delete user
```

### **Profile Management**
```
GET    /api/mikrotik/profiles     - Get all hotspot profiles
```

### **Voucher Creation**
```
POST   /api/mikrotik/voucher      - Create voucher in MikroTik
```

## 📊 Schema Database

### **MikroTikSettings**
```sql
CREATE TABLE MikroTikSettings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER DEFAULT 8728,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  version TEXT DEFAULT 'v6',
  useSSL BOOLEAN DEFAULT false,
  timeout INTEGER DEFAULT 10000,
  isActive BOOLEAN DEFAULT true,
  hotspotInterface TEXT,
  hotspotName TEXT,
  defaultProfile TEXT,
  connectionStatus TEXT DEFAULT 'never',
  lastConnected DATETIME,
  errorMessage TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Updated Voucher Table**
```sql
-- Added MikroTik integration fields
ALTER TABLE Voucher ADD COLUMN mikrotikProfile TEXT;
ALTER TABLE Voucher ADD COLUMN timeLimit TEXT;
ALTER TABLE Voucher ADD COLUMN dataLimit TEXT;
ALTER TABLE Voucher ADD COLUMN autoCreate BOOLEAN DEFAULT false;
ALTER TABLE Voucher ADD COLUMN syncWithMikrotik BOOLEAN DEFAULT false;
```

### **Updated Transaction Table**
```sql
-- Added MikroTik tracking fields
ALTER TABLE Transaction ADD COLUMN mikrotikUsername TEXT;
ALTER TABLE Transaction ADD COLUMN mikrotikPassword TEXT;
ALTER TABLE Transaction ADD COLUMN mikrotikProfile TEXT;
ALTER TABLE Transaction ADD COLUMN mikrotikCreated BOOLEAN DEFAULT false;
ALTER TABLE Transaction ADD COLUMN mikrotikSynced BOOLEAN DEFAULT false;
```

## 🔄 Flow Transaksi

### **Auto-Creation Flow**
1. User membeli voucher via website
2. Sistem membuat transaksi di database
3. Jika voucher memiliki `autoCreate=true`:
   - Connect ke MikroTik API
   - Generate username & password random
   - Create user hotspot dengan profile yang ditentukan
   - Update transaksi dengan MikroTik credentials
   - Return voucher code ke user

### **Manual Creation**
Admin dapat manually create voucher MikroTik:
1. Menuju `MikroTik Management` → `Users`
2. Click `Create Voucher`
3. Pilih profile dan set limits
4. System create user di MikroTik

## 🛡️ Keamanan

### **API Security**
- Password hashing di database
- JWT authentication untuk API access
- Timeout koneksi untuk mencegah hanging
- Error handling tanpa expose sensitive data

### **Network Security**
- Whitelist IP addresses di MikroTik API
- Gunakan dedicated API user dengan limited privileges
- Enable SSL/TLS untuk production (RouterOS v7)
- Monitor failed connection attempts

### **Data Protection**
- Tidak simpan plain text password di logs
- Encrypt sensitive configuration
- Regular password rotation untuk API user

## 🔍 Troubleshooting

### **Connection Issues**
```bash
# Check API service status
/ip service print where name="api"

# Test API connection
/tool fetch url="http://192.168.1.1:8728" mode=http

# Check firewall rules
/ip firewall filter print where action=drop
```

### **Common Errors**

#### **"Connection Timeout"**
- Check IP address dan port
- Verify API service enabled
- Check firewall blocking port 8728

#### **"Authentication Failed"**
- Verify username dan password
- Check user group permissions
- Ensure API user not disabled

#### **"Profile Not Found"**
- Sync profiles dari MikroTik
- Check profile name spelling
- Create profile di RouterOS

### **Debug Steps**
1. Test koneksi via WinBox/WebFig
2. Verify API service: `ip service print`
3. Check user permissions: `user print`
4. Test with curl: `curl http://router-ip:8728`
5. Check system logs: `/log print`

## 📈 Monitoring

### **Dashboard Metrics**
- Total users per profile
- Active vs idle users
- Data usage statistics
- Connection status history

### **Alerts**
- Connection failure notifications
- High data usage warnings
- User limit approaching

### **Logs**
- Connection attempts
- User creation/deletion
- Sync operations
- Error tracking

## 🚀 Best Practices

### **Performance**
- Use connection pooling untuk multiple requests
- Cache profile data untuk reduce API calls
- Implement rate limiting untuk API requests
- Monitor response times

### **Reliability**
- Implement retry logic untuk failed connections
- Backup MikroTik configuration regularly
- Monitor disk space dan memory usage
- Set up alerting untuk system issues

### **Scalability**
- Load balance multiple MikroTik devices
- Implement queue system untuk voucher creation
- Use Redis untuk session management
- Consider microservices architecture

## 📚 Contoh Konfigurasi

### **Production Setup**
```javascript
// MikroTik Settings Example
{
  "name": "Main Office Router",
  "host": "192.168.1.1",
  "port": 8728,
  "username": "mljnet-api",
  "password": "secure-api-password",
  "version": "v7",
  "useSSL": true,
  "timeout": 15000,
  "isActive": true,
  "hotspotInterface": "ether1",
  "hotspotName": "MLJ-NET Hotspot",
  "defaultProfile": "default"
}
```

### **Voucher Configuration**
```javascript
// Voucher with MikroTik Integration
{
  "name": "Voucher 1 Jam",
  "price": 5000,
  "duration": "1 jam",
  "mikrotikProfile": "1hour",
  "timeLimit": "1h",
  "dataLimit": null,
  "autoCreate": true,
  "syncWithMikrotik": true
}
```

## 🎯 Advanced Features

### **Custom Rate Limits**
```bash
# Create profile with custom rate limits
/ip hotspot user profile add \
  name=premium \
  rate-limit=1M/2M \
  shared-users=1 \
  uptime-limit=1d
```

### **Data Quota Management**
```bash
# Profile with data quota
/ip hotspot user profile add \
  name=quota-1gb \
  limit-bytes-total=1G \
  limit-bytes-out=512M \
  limit-bytes-in=512M
```

### **Time-Based Access**
```bash
# Profile with time restrictions
/ip hotspot user profile add \
  name=office-hours \
  uptime-limit=8h \
  session-timeout=1h
```

---

## 📞 Support

Untuk bantuan teknis integrasi MikroTik:
- Documentation: `/MIKROTIK_INTEGRATION.md`
- API Reference: Check endpoint documentation
- Troubleshooting: See troubleshooting section
- Community: Forum dan diskusi teknis

*Integrasi MikroTik ini menyediakan solusi lengkap untuk manajemen hotspot WiFi otomatis dengan kemudahan penggunaan dan monitoring real-time.*