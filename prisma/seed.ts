import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mljnet.com' },
    update: {},
    create: {
      email: 'admin@mljnet.com',
      password: hashedPassword,
      name: 'Admin MLJ-NET',
      role: 'ADMIN'
    }
  })
  console.log('Created admin:', admin)

  // Create default vouchers
  const vouchers = [
    {
      name: 'MLJ-Hotspot VC 5 JAM',
      price: 2000,
      duration: '5 Jam',
      description: 'Voucher WiFi untuk 5 jam',
      popular: false,
      active: true
    },
    {
      name: 'MLJ-Hotspot VC 12 JAM',
      price: 3000,
      duration: '12 Jam',
      description: 'Voucher WiFi untuk 12 jam',
      popular: false,
      active: true
    },
    {
      name: 'MLJ-Hotspot VC 24 JAM',
      price: 5000,
      duration: '24 Jam',
      description: 'Voucher WiFi untuk 24 jam',
      popular: true,
      active: true
    },
    {
      name: 'MLJ-Hotspot VC 7 HARI',
      price: 15000,
      duration: '7 Hari',
      description: 'Voucher WiFi untuk 7 hari',
      popular: false,
      active: true
    },
    {
      name: 'MLJ-Hotspot VC 30 HARI',
      price: 50000,
      duration: '30 Hari',
      description: 'Voucher WiFi untuk 30 hari',
      popular: false,
      active: true
    }
  ]

  for (const voucher of vouchers) {
    const existingVoucher = await prisma.voucher.findFirst({
      where: { name: voucher.name }
    })
    
    if (!existingVoucher) {
      const createdVoucher = await prisma.voucher.create({
        data: voucher
      })
      console.log('Created voucher:', createdVoucher.name)
    } else {
      console.log('Voucher already exists:', existingVoucher.name)
    }
  }

  // Create default website settings
  let websiteSettings = await prisma.websiteSettings.findFirst()
  if (!websiteSettings) {
    websiteSettings = await prisma.websiteSettings.create({
      data: {
        siteName: 'MLJ-NET',
        siteTitle: 'MLJ-NET - WiFi Hotspot Voucher Tercepat',
        description: 'Provider internet hotspot terpercaya dengan voucher WiFi murah dan cepat. Nikmati internet super cepat hingga 100 Mbps dengan harga terjangkau.',
        keywords: 'MLJ-NET, WiFi, Hotspot, Internet, Voucher WiFi, Internet Cepat, Provider WiFi, Hotspot Voucher',
        contactEmail: 'info@mljnet.com',
        contactPhone: '0812-3456-7890',
        contactAddress: 'Jakarta, Indonesia',
        logoUrl: '/logo.png',
        faviconUrl: '/favicon.png',
        primaryColor: '#facc15',
        secondaryColor: '#f97316'
      }
    })
    console.log('Created website settings')
  } else {
    console.log('Website settings already exist')
  }

  // Create default payment settings
  let paymentSettings = await prisma.paymentSettings.findFirst()
  if (!paymentSettings) {
    paymentSettings = await prisma.paymentSettings.create({
      data: {
        qrisEnabled: true,
        qrisImageUrl: '/qris-code.png',
        transferEnabled: true,
        bankName: 'BCA',
        bankAccount: 'MLJ-NET',
        bankNumber: '1234567890',
        ewalletEnabled: true,
        goPayNumber: '0812-3456-7890',
        ovoNumber: '0812-3456-7890',
        danaNumber: '0812-3456-7890',
        linkAjaNumber: '0812-3456-7890'
      }
    })
    console.log('Created payment settings')
  } else {
    console.log('Payment settings already exist')
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })