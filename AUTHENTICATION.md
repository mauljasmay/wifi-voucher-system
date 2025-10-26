# Sistem Autentikasi Admin MLJ-NET

## 📋 Overview

Sistem autentikasi ini mendukung dua role admin:
- **Super Admin**: Akses penuh ke semua fitur termasuk manajemen admin
- **Admin**: Akses terbatas ke dashboard dan fitur operasional

## 🔑 Login Credentials

### Default Accounts
```
Super Admin:
Email: superadmin@mljnet.com
Password: admin123

Admin:
Email: admin@mljnet.com
Password: admin123
```

## 🚀 Cara Mengakses

### 1. Login Admin
1. Buka website MLJ-NET
2. Klik menu "Admin" di navigation bar
3. Masukkan email dan password
4. Klik "Masuk"

### 2. Dashboard Features
- **Overview**: Statistik member, voucher, dan transaksi
- **Quick Actions**: Akses cepat ke manajemen voucher, member, dan transaksi
- **Recent Activity**: Daftar transaksi terbaru

### 3. Manajemen Admin (Hanya Super Admin)
- Tambah admin baru
- Lihat daftar admin
- Role assignment (Admin/Super Admin)

## 🛡️ Keamanan

### Session Management
- Token JWT dengan expiry 7 hari
- Cookie-based authentication
- Auto-logout pada token expiry

### Route Protection
- Middleware proteksi semua route `/admin/*`
- Redirect otomatis ke login jika belum authenticated
- Role-based access control

### Password Security
- Hashing dengan bcryptjs
- Minimum password length: 6 karakter

## 📁 File Structure

### Backend API Routes
```
src/app/api/auth/
├── login/route.ts      # Login endpoint
├── logout/route.ts     # Logout endpoint
└── me/route.ts         # Get current admin

src/app/api/admin/
└── route.ts            # Admin management (Super Admin only)
```

### Frontend Pages
```
src/app/admin/
├── login/page.tsx      # Login form
├── dashboard/page.tsx  # Admin dashboard
└── admins/page.tsx     # Admin management (Super Admin only)
```

### Libraries & Context
```
src/contexts/
└── AuthContext.tsx     # Authentication state management

src/lib/
└── auth.ts            # Authentication utilities
```

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=file:./db/dev.db
```

### Database Schema
```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(ADMIN)
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
}
```

## 🎯 Role Permissions

### Super Admin
- ✅ Dashboard access
- ✅ Manage vouchers
- ✅ Manage members
- ✅ View transactions
- ✅ Manage admins (add/view)
- ✅ System settings

### Admin
- ✅ Dashboard access
- ✅ Manage vouchers
- ✅ Manage members
- ✅ View transactions
- ❌ Manage admins
- ❌ System settings

## 🔄 Session Flow

1. **Login**: POST `/api/auth/login`
   - Validate email/password
   - Generate JWT token
   - Set cookie & localStorage
   - Redirect to dashboard

2. **Authentication Check**: GET `/api/auth/me`
   - Verify JWT token
   - Return admin data
   - Auto-redirect if invalid

3. **Logout**: POST `/api/auth/logout`
   - Clear cookie & localStorage
   - Redirect to login page

## 🛠️ Troubleshooting

### Common Issues
1. **Login gagal**: Pastikan email dan password benar
2. **Access denied**: Check role permissions
3. **Session expired**: Login kembali
4. **Database error**: Restart server dan check schema

### Debug Steps
1. Check browser console untuk error
2. Verify database connection
3. Check JWT secret configuration
4. Clear browser cache & cookies

## 📝 Development Notes

- Token disimpan di cookie dan localStorage untuk fallback
- Middleware handles route protection automatically
- Auto-redirect berdasarkan authentication status
- Responsive design untuk mobile & desktop
- TypeScript strict typing untuk type safety