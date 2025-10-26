# 📱 WiFi Voucher System - QRIS Payment Integration

A modern WiFi Voucher sales system built with Next.js, integrating Tripay QRIS payment gateway for seamless digital transactions in Indonesia.

## 🌟 Features

### 💳 Payment System
- **QRIS Payment Integration** - Support all major Indonesian e-wallets (GoPay, OVO, Dana, etc.)
- **Real-time Payment Status** - Automatic payment verification every 5 seconds
- **24-hour Payment Window** - Countdown timer for payment expiration
- **Automated Voucher Delivery** - Instant WhatsApp delivery upon successful payment

### 🎫 Voucher Management
- **Multiple Voucher Packages** - 1-hour, 1-day, 7-day options
- **Dynamic Pricing** - Competitive pricing for different durations
- **Automatic Code Generation** - Secure 12-character voucher codes
- **Usage Instructions** - Detailed hotspot login guide

### 📱 User Experience
- **Mobile-First Design** - Optimized for mobile devices
- **Dark/Light Mode** - Theme toggle support
- **WhatsApp Integration** - Only phone number required for checkout
- **Responsive Layout** - Works seamlessly on all devices

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Lucide Icons** - Beautiful icon set

### Backend
- **Next.js API Routes** - Server-side functionality
- **Prisma ORM** - Database management
- **SQLite** - Lightweight database
- **Tripay API** - Payment gateway integration

### Deployment
- **PM2** - Process management
- **Nginx** - Reverse proxy
- **Ubuntu 22.04** - Server environment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Tripay API credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/wifi-voucher-system.git
cd wifi-voucher-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# Tripay Configuration
TRIPAY_API_KEY=your_tripay_api_key
TRIPAY_PRIVATE_KEY=your_tripay_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code

# Database
DATABASE_URL="file:./dev.db"

# WhatsApp (optional)
WHATSAPP_API_KEY=your_whatsapp_api_key
```

4. **Database setup**
```bash
npx prisma generate
npx prisma db push
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   └── tripay/     # Tripay payment endpoints
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── voucher/       # Voucher-related components
│   ├── lib/               # Utility functions
│   │   ├── db.ts          # Database client
│   │   ├── prisma.ts      # Prisma client
│   │   ├── utils.ts       # Helper functions
│   │   └── validators.ts  # Form validation
│   └── types/             # TypeScript definitions
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets
└── README.md
```

## 💾 Database Schema

### Vouchers
- `id` - Unique identifier
- `code` - 12-character voucher code
- `duration` - Voucher duration (hours)
- `price` - Price in IDR
- `isUsed` - Usage status
- `createdAt` - Creation timestamp
- `usedAt` - Usage timestamp

### Orders
- `id` - Unique identifier
- `reference` - Tripay reference
- `whatsappNumber` - Customer WhatsApp
- `voucherId` - Associated voucher
- `amount` - Payment amount
- `status` - Payment status
- `paymentMethod` - Payment method
- `createdAt` - Order timestamp

## 🔄 Payment Flow

1. **Package Selection** - User chooses voucher package
2. **WhatsApp Input** - User enters WhatsApp number
3. **Payment Generation** - System creates Tripay payment order
4. **QR Code Display** - QRIS code shown for scanning
5. **Payment Verification** - System checks payment status every 5 seconds
6. **Voucher Delivery** - Automatic WhatsApp delivery upon success

## 📱 API Endpoints

### Payment
- `POST /api/tripay/payment` - Create payment order
- `POST /api/tripay/callback` - Handle payment callback
- `GET /api/tripay/status/:reference` - Check payment status

### Vouchers
- `GET /api/vouchers` - List available vouchers
- `POST /api/vouchers` - Create new voucher
- `GET /api/vouchers/:code` - Get voucher details

## 🎨 UI Components

### Core Components
- `VoucherCard` - Voucher package display
- `PaymentModal` - Payment interface
- `QRCodeDisplay` - QR code visualization
- `CountdownTimer` - Payment countdown
- `StatusIndicator` - Payment status

### Features
- Responsive design for all screen sizes
- Dark/light theme support
- Loading states and error handling
- Smooth animations and transitions

## 🔧 Configuration

### Tripay Setup
1. Register at [Tripay Dashboard](https://tripay.co.id/)
2. Create a new payment channel
3. Enable QRIS payment method
4. Copy API credentials to environment variables

### WhatsApp Integration (Optional)
- Configure WhatsApp Business API
- Set up webhook for message sending
- Add API key to environment variables

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### PM2 Process Management
```bash
pm2 start npm --name "wifi-voucher" -- start
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testing

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## 📊 Monitoring

### Logs
- Application logs: `server.log`
- Development logs: `dev.log`
- Error tracking with structured logging

### Performance
- Next.js built-in analytics
- Database query optimization
- Image optimization with Next.js Image component

## 🔒 Security

### Implementation
- Environment variable protection
- API key encryption
- Input validation and sanitization
- CSRF protection
- Rate limiting on API endpoints

### Best Practices
- Regular dependency updates
- Security headers configuration
- HTTPS enforcement in production
- Database connection encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@your-domain.com
- 💬 WhatsApp: +62 812-3456-7890
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/wifi-voucher-system/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tripay](https://tripay.co.id/) - Payment gateway
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://prisma.io/) - Database ORM

---

**Built with ❤️ for Indonesian WiFi Voucher Market**