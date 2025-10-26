# Integrasi Tripay Payment Gateway

Dokumentasi untuk integrasi payment gateway Tripay pada sistem MLJ-NET WiFi Hotspot.

## 🚀 Fitur yang Ditambahkan

### 1. Database Schema
- **PaymentSettings**: Tambahkan field untuk konfigurasi Tripay
  - `tripayEnabled`: Status aktif/non-aktif Tripay
  - `tripayApiKey`: API Key dari Tripay
  - `tripayPrivateKey`: Private Key untuk signature
  - `tripayMerchantCode`: Kode merchant
  - `tripayMode`: Mode (SANDBOX/PRODUCTION)

- **Transaction**: Tambahkan field untuk tracking Tripay
  - `tripayReference`: Reference number dari Tripay
  - `tripayPaymentUrl`: URL pembayaran
  - `tripayPaymentChannel`: Channel pembayaran
  - `tripayPaymentMethod`: Nama metode pembayaran

### 2. API Endpoints

#### `/api/tripay/channels` (GET)
- Mendapatkan daftar channel pembayaran yang tersedia
- Memerlukan konfigurasi Tripay yang lengkap

#### `/api/tripay/transaction` (POST)
- Membuat transaksi pembayaran baru
- Request body:
  ```json
  {
    "voucherId": "string",
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "paymentMethod": "string"
  }
  ```

#### `/api/tripay/callback` (POST)
- Callback dari Tripay untuk update status pembayaran
- Otomatis generate voucher code jika status PAID

### 3. Admin Panel
- Halaman `/admin/payments` ditambahkan pengaturan Tripay
- Konfigurasi API Key, Private Key, dan Merchant Code
- Pilihan mode Sandbox/Production
- Informasi callback URL

### 4. User Interface
- Halaman `/vouchers` untuk pembelian voucher
- Pilihan metode pembayaran Tripay
- Redirect ke halaman pembayaran Tripay
- Dashboard `/dashboard` untuk tracking transaksi

## 📋 Cara Konfigurasi

### 1. Dapatkan API Key Tripay
1. Login ke dashboard Tripay (https://tripay.co.id)
2. Buat merchant baru
3. Catat API Key, Private Key, dan Merchant Code
4. Set callback URL: `https://domain-anda.com/api/tripay/callback`

### 2. Konfigurasi di Admin Panel
1. Login ke admin panel (`/admin/login`)
2. Menu: Settings → Payment Settings
3. Aktifkan "Tripay Payment Gateway"
4. Isi konfigurasi:
   - Mode: Sandbox (testing) atau Production
   - Kode Merchant: dari dashboard Tripay
   - API Key: dari dashboard Tripay
   - Private Key: dari dashboard Tripay

### 3. Testing
- Gunakan mode Sandbox untuk testing
- Tripay menyediakan simulasi pembayaran
- Pastikan callback berfungsi dengan baik

## 🔧 Technical Details

### Signature Generation
```typescript
const rawSignature = `${merchantCode}${merchantRef}${amount}`;
const signature = crypto.createHmac('sha256', privateKey).update(rawSignature).digest('hex');
```

### Callback Validation
```typescript
const rawSignature = `${tripay_ref}${merchant_ref}${status}`;
const expectedSignature = crypto.createHmac('sha256', privateKey).update(rawSignature).digest('hex');
```

### Payment Flow
1. User pilih voucher dan metode pembayaran Tripay
2. System buat transaksi di database
3. Request ke Tripay API untuk create payment
4. User di-redirect ke halaman pembayaran Tripay
5. Tripay callback ke system saat pembayaran selesai
6. System update status dan generate voucher code

## 🛡️ Keamanan

- Private Key disimpan encrypted di database
- Signature validation untuk callback
- HTTPS required untuk production
- Rate limiting pada API endpoints

## 📝 Channel Pembayaran Tersedia

Tripay mendukung berbagai channel pembayaran:
- **Virtual Account**: BCA, BNI, BRI, Mandiri, dll
- **E-Wallet**: GoPay, OVO, DANA, LinkAja, ShopeePay
- **Convenience Store**: Alfamart, Indomaret
- **QR Code**: QRIS
- **Credit Card**: Visa, Mastercard

## 🔍 Troubleshooting

### Common Issues
1. **Invalid Signature**: Pastikan Private Key benar
2. **Callback Not Working**: Cek URL callback di dashboard Tripay
3. **Transaction Failed**: Pastikan API Key valid dan mode sesuai
4. **Payment Not Redirecting**: Cek konfigurasi return URL

### Debug Mode
- Aktifkan console log untuk debugging
- Cek network tab di browser developer tools
- Monitor log server untuk error tracking

## 📞 Support

- Tripay Documentation: https://tripay.co.id/developer
- API Reference: https://tripay.co.id/developer/documentations
- Support Email: support@tripay.co.id

---

**Note**: Integrasi ini menggunakan Tripay API v2. Pastikan menggunakan endpoint yang sesuai dengan versi API yang digunakan.