'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Wifi, 
  Clock, 
  Smartphone, 
  QrCode, 
  Check, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Shield, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Users,
  Router,
  Globe,
  TrendingUp,
  Award,
  Headphones,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  UserCheck,
  Crown,
  Rocket,
  Settings,
  CheckCircle
} from 'lucide-react'
import Image from 'next/image'

interface Voucher {
  id: string
  name: string
  price: number
  duration: string
  description?: string
  popular: boolean
  active: boolean
}

interface WebsiteSettings {
  siteName: string
  siteTitle: string
  description: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
}

interface PaymentSettings {
  qrisEnabled: boolean
  qrisImageUrl?: string
  transferEnabled: boolean
  bankName?: string
  bankAccount?: string
  bankNumber?: string
  ewalletEnabled: boolean
  goPayNumber?: string
  ovoNumber?: string
  danaNumber?: string
  linkAjaNumber?: string
  tripayEnabled: boolean
}

interface MembershipPlan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  popular?: boolean
  description: string
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'voucher' | 'member'>('voucher')
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    plan: 'basic'
  })
  const [isSubmittingMember, setIsSubmittingMember] = useState(false)
  const [memberSuccess, setMemberSuccess] = useState('')

  const membershipPlans: MembershipPlan[] = [
    {
      id: 'basic',
      name: 'Basic Member',
      price: 50000,
      duration: '1 Bulan',
      description: 'Cocok untuk pengguna harian dengan kebutuhan internet standar',
      features: [
        'Akses WiFi di semua lokasi',
        'Kecepatan hingga 10 Mbps',
        '1 device terhubung',
        'Support via WhatsApp',
        'Voucher mingguan gratis'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Member',
      price: 100000,
      duration: '1 Bulan',
      description: 'Ideal untuk pengguna aktif dengan kebutuhan internet tinggi',
      popular: true,
      features: [
        'Akses WiFi di semua lokasi',
        'Kecepatan hingga 25 Mbps',
        '3 device terhubung',
        'Support prioritas',
        'Voucher mingguan gratis',
        'Bonus quota 10GB',
        'Akses area premium'
      ]
    },
    {
      id: 'business',
      name: 'Business Member',
      price: 250000,
      duration: '1 Bulan',
      description: 'Perfect untuk bisnis dan kebutuhan internet profesional',
      features: [
        'Akses WiFi di semua lokasi',
        'Kecepatan hingga 50 Mbps',
        'Unlimited devices',
        'Support 24/7',
        'Voucher unlimited',
        'Dedicated bandwidth',
        'Static IP available',
        'Custom package available'
      ]
    }
  ]

  const features = [
    { icon: Zap, title: 'Super Cepat', description: 'Internet hingga 100 Mbps untuk streaming dan gaming tanpa hambatan' },
    { icon: Shield, title: 'Aman & Terpercaya', description: 'Jaringan terenkripsi dengan sistem keamanan berlapis' },
    { icon: Users, title: 'Support 24/7', description: 'Tim support siap membantu kapan saja Anda butuhkan' },
    { icon: Router, title: 'Coverage Luas', description: 'Jaringan tersebar di berbagai lokasi strategis' },
    { icon: Award, title: 'Bergaransi', description: 'Garansi kepuasan 100% atau uang kembali' },
    { icon: TrendingUp, title: 'Terjangkau', description: 'Harga kompetitif dengan kualitas terbaik' }
  ]

  const locations = [
    { name: 'MLJ-NET Center', address: 'Jl. Merdeka No. 123, Kota', status: 'Online' },
    { name: 'MLJ-NET Cafe', address: 'Jl. Sudirman No. 45, Kota', status: 'Online' },
    { name: 'MLJ-NET Co-working', address: 'Jl. Gatot Subroto No. 78, Kota', status: 'Online' }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vouchersRes, settingsRes, paymentsRes] = await Promise.all([
        fetch('/api/vouchers'),
        fetch('/api/settings'),
        fetch('/api/payments')
      ])

      const vouchersData = await vouchersRes.json()
      const settingsData = await settingsRes.json()
      const paymentsData = await paymentsRes.json()

      if (vouchersData.vouchers) {
        setVouchers(vouchersData.vouchers)
      }
      if (settingsData.settings) {
        setWebsiteSettings(settingsData.settings)
      }
      if (paymentsData.settings) {
        setPaymentSettings(paymentsData.settings)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingMember(true)
    setMemberSuccess('')

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberForm),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMemberSuccess('Pendaftaran member berhasil! Tim kami akan menghubungi Anda dalam 24 jam.')
        setMemberForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          plan: 'basic'
        })
        setMemberDialogOpen(false)
      } else {
        setMemberSuccess(data.error || 'Pendaftaran gagal. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      setMemberSuccess('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmittingMember(false)
    }
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  const siteName = websiteSettings?.siteName || 'MLJ-NET'
  const siteTitle = websiteSettings?.siteTitle || 'MLJ-NET - WiFi Hotspot Voucher Tercepat'
  const siteDescription = websiteSettings?.description || 'Provider internet hotspot terpercaya dengan voucher WiFi murah dan cepat'
  const logoUrl = websiteSettings?.logoUrl || '/logo.png'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black text-white transition-colors">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-gray-900/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-700 dark:border-gray-800"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative w-8 h-8"
              >
                <Image
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  fill
                  className="object-contain"
                />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {siteName}
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-6">
              {['Beranda', 'Layanan', 'Harga', 'Lokasi'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors text-gray-300 dark:text-gray-300"
                >
                  {item}
                </motion.a>
              ))}
              <motion.a
                href="/voucher"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors font-semibold text-gray-300 dark:text-gray-300"
              >
                Beli Voucher
              </motion.a>
              <motion.a
                href="#kontak"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors text-gray-300 dark:text-gray-300"
              >
                Kontak
              </motion.a>
              <ThemeToggle />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Member Area
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-2"
            >
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gray-800 dark:bg-black border-t border-gray-700 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-2 space-y-2">
                {['Beranda', 'Layanan', 'Harga', 'Lokasi'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="block py-2 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors text-gray-300 dark:text-gray-300"
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.a
                  href="/voucher"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="block py-2 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors font-semibold text-gray-300 dark:text-gray-300"
                >
                  Beli Voucher
                </motion.a>
                <motion.a
                  href="#kontak"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="block py-2 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors text-gray-300 dark:text-gray-300"
                >
                  Kontak
                </motion.a>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Member Area
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        id="beranda" 
        className="relative py-20 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10"
          animate={{ 
            background: [
              "linear-gradient(to right, rgba(254, 240, 138, 0.1), rgba(253, 224, 71, 0.1))",
              "linear-gradient(to right, rgba(253, 224, 71, 0.1), rgba(250, 204, 21, 0.1))",
              "linear-gradient(to right, rgba(250, 204, 21, 0.1), rgba(254, 240, 138, 0.1))"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Badge className="mb-4 bg-yellow-400 text-black">
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚀
                </motion.span>
                Internet Hotspot Tercepat & Terpercaya
              </Badge>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {siteName} Hotspot
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {siteDescription}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 text-lg px-8 py-3 rounded-lg font-semibold flex items-center justify-center"
                onClick={() => window.location.href = '/voucher'}
              >
                <Wifi className="mr-2 h-5 w-5" />
                Beli Voucher Sekarang
                <ChevronRight className="ml-2 h-5 w-5" />
              </motion.button>
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border border-gray-600 hover:bg-gray-800 text-lg px-8 py-3 rounded-lg font-semibold flex items-center justify-center"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Daftar Member
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      Daftar Member {siteName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Dapatkan keuntungan eksklusif dengan menjadi member kami
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleMemberSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          value={memberForm.name}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Masukkan nama lengkap"
                          className="bg-gray-700 border-gray-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={memberForm.email}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="bg-gray-700 border-gray-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Nomor WhatsApp</Label>
                        <Input
                          id="phone"
                          value={memberForm.phone}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="08xx-xxxx-xxxx"
                          className="bg-gray-700 border-gray-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plan">Pilih Paket</Label>
                        <select
                          id="plan"
                          value={memberForm.plan}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, plan: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                          <option value="basic">Basic Member - Rp 50.000/bulan</option>
                          <option value="premium">Premium Member - Rp 100.000/bulan</option>
                          <option value="business">Business Member - Rp 250.000/bulan</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat</Label>
                      <textarea
                        id="address"
                        value={memberForm.address}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        required
                      />
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-400 mb-2">Benefit Member:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>✓ Akses WiFi di semua lokasi</li>
                        <li>✓ Voucher gratis setiap minggu</li>
                        <li>✓ Support prioritas 24/7</li>
                        <li>✓ Kecepatan internet lebih tinggi</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                      disabled={isSubmittingMember}
                    >
                      {isSubmittingMember ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Memproses...
                        </>
                      ) : (
                        'Daftar Sekarang'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {[
                { label: 'Lokasi', value: '15+', icon: MapPin },
                { label: 'Member Aktif', value: '5000+', icon: Users },
                { label: 'Kecepatan', value: '100 Mbps', icon: Zap },
                { label: 'Uptime', value: '99.9%', icon: CheckCircle }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
                >
                  <stat.icon className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        id="layanan" 
        className="py-16 px-4 bg-gray-800/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Layanan Kami
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Solusi internet hotspot lengkap untuk kebutuhan personal dan bisnis Anda
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wifi,
                title: 'WiFi Voucher',
                description: 'Akses internet instan dengan voucher harian, mingguan, dan bulanan',
                features: ['Tanpa berlangganan', 'Cukup beli voucher', 'Langsung aktif', 'Berbagai pilihan durasi'],
                color: 'from-blue-400 to-blue-600'
              },
              {
                icon: Crown,
                title: 'Membership',
                description: 'Berlangganan untuk mendapatkan keuntungan eksklusif',
                features: ['Voucher gratis', 'Kecepatan prioritas', 'Support 24/7', 'Akses semua lokasi'],
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Router,
                title: 'Business Solution',
                description: 'Solusi internet untuk kebutuhan bisnis dan kantor',
                features: ['Dedicated bandwidth', 'Static IP', 'Custom package', 'SLA guarantee'],
                color: 'from-green-400 to-green-600'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full hover:border-yellow-400 transition-colors">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-4`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-300">
                          <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                      onClick={() => {
                        if (service.title === 'WiFi Voucher') {
                          window.location.href = '/voucher'
                        } else if (service.title === 'Membership') {
                          setMemberDialogOpen(true)
                        } else {
                          window.location.href = `mailto:${websiteSettings?.contactEmail || 'info@mljnet.com'}`
                        }
                      }}
                    >
                      {service.title === 'WiFi Voucher' ? 'Beli Voucher' : 
                       service.title === 'Membership' ? 'Daftar Member' : 'Hubungi Sales'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="harga" 
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Harga & Paket
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Pilih paket yang sesuai dengan kebutuhan dan budget Anda
            </p>
            
            {/* Toggle */}
            <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
              <Button
                variant={selectedPlan === 'voucher' ? 'default' : 'ghost'}
                onClick={() => setSelectedPlan('voucher')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  selectedPlan === 'voucher' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Voucher
              </Button>
              <Button
                variant={selectedPlan === 'member' ? 'default' : 'ghost'}
                onClick={() => setSelectedPlan('member')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  selectedPlan === 'member' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="h-4 w-4 mr-2" />
                Membership
              </Button>
            </div>
          </motion.div>

          {/* Voucher Pricing */}
          <AnimatePresence mode="wait">
            {selectedPlan === 'voucher' && (
              <motion.div
                key="voucher"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {vouchers.slice(0, 4).map((voucher, index) => (
                  <motion.div
                    key={voucher.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className={`bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full hover:border-yellow-400 transition-colors ${
                      voucher.popular ? 'ring-2 ring-yellow-400' : ''
                    }`}>
                      {voucher.popular && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-1 text-sm font-semibold">
                          POPULER
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg">{voucher.name}</CardTitle>
                        <div className="text-3xl font-bold text-yellow-400">
                          Rp {voucher.price.toLocaleString('id-ID')}
                        </div>
                        <CardDescription className="text-gray-300">
                          {voucher.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 text-center mb-4">
                          {voucher.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                          onClick={() => window.location.href = '/voucher'}
                        >
                          Beli Sekarang
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Membership Pricing */}
          <AnimatePresence mode="wait">
            {selectedPlan === 'member' && (
              <motion.div
                key="member"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
              >
                {membershipPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className={`bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full hover:border-yellow-400 transition-colors ${
                      plan.popular ? 'ring-2 ring-yellow-400' : ''
                    }`}>
                      {plan.popular && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-1 text-sm font-semibold">
                          REKOMENDASI
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl flex items-center justify-center">
                          {plan.name === 'Business Member' && <Crown className="h-5 w-5 mr-2 text-yellow-400" />}
                          {plan.name}
                        </CardTitle>
                        <div className="text-3xl font-bold text-yellow-400">
                          Rp {plan.price.toLocaleString('id-ID')}
                        </div>
                        <CardDescription className="text-gray-300">
                          {plan.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 text-center mb-4">
                          {plan.description}
                        </p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-300">
                              <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => {
                            setMemberForm(prev => ({ ...prev, plan: plan.id }))
                            setMemberDialogOpen(true)
                          }}
                        >
                          {plan.popular ? 'Pilih Sekarang' : 'Daftar Sekarang'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        className="py-16 px-4 bg-gray-800/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Mengapa Memilih {siteName}?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Kami berkomitmen memberikan layanan internet terbaik untuk Anda
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full hover:border-yellow-400 transition-colors">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Locations Section */}
      <motion.section 
        id="lokasi" 
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Lokasi Kami
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Jangkauan luas di berbagai lokasi strategis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {locations.map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:border-yellow-400 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <MapPin className="h-6 w-6 text-yellow-400" />
                      <Badge className="bg-green-900/20 border-green-800 text-green-400">
                        {location.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
                    <p className="text-gray-400 text-sm">{location.address}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="kontak" 
        className="py-16 px-4 bg-gray-800/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Hubungi Kami
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Tim kami siap membantu Anda 24/7
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Telepon</h3>
              <p className="text-gray-400">{websiteSettings?.contactPhone || '+62 812-3456-7890'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-400">{websiteSettings?.contactEmail || 'info@mljnet.com'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Support 24/7</h3>
              <p className="text-gray-400">WhatsApp: {websiteSettings?.contactPhone || '+62 812-3456-7890'}</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Success Message */}
      {memberSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Alert className="bg-green-900/20 border-green-800 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{memberSuccess}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src={logoUrl}
              alt={`${siteName} Logo`}
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {siteName}
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            {siteDescription}
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>© 2024 {siteName}. All rights reserved.</span>
            <span>•</span>
            <span>Powered by MLJ-NET Technology</span>
          </div>
        </div>
      </footer>
    </div>
  )
}