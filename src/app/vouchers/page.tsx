'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Wifi, 
  Clock, 
  Star, 
  ShoppingCart,
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Voucher {
  id: string
  name: string
  price: number
  duration: string
  description?: string
  popular: boolean
  active: boolean
}

interface TripayChannel {
  code: string
  name: string
  icon: string
  active: boolean
  fee: {
    flat: number
    percent: string
  }
  total_fee: {
    flat: number
    percent: string
  }
  instructions: {
    title: string
    steps: string[]
  }[]
}

interface PaymentSettings {
  qrisEnabled: boolean
  transferEnabled: boolean
  ewalletEnabled: boolean
  tripayEnabled: boolean
  bankName?: string
  bankAccount?: string
  bankNumber?: string
  goPayNumber?: string
  ovoNumber?: string
  danaNumber?: string
  linkAjaNumber?: string
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [tripayChannels, setTripayChannels] = useState<TripayChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: '',
    tripayChannel: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')

  useEffect(() => {
    fetchVouchers()
    fetchPaymentSettings()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/vouchers')
      const data = await response.json()
      if (data.vouchers) {
        setVouchers(data.vouchers.filter((v: Voucher) => v.active))
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.paymentSettings) {
        setPaymentSettings(data.paymentSettings)
        
        // Fetch Tripay channels if enabled
        if (data.paymentSettings.tripayEnabled) {
          fetchTripayChannels()
        }
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
    }
  }

  const fetchTripayChannels = async () => {
    try {
      const response = await fetch('/api/tripay/channels')
      const data = await response.json()
      if (data.success) {
        setTripayChannels(data.data.filter((channel: TripayChannel) => channel.active))
      }
    } catch (error) {
      console.error('Error fetching Tripay channels:', error)
    }
  }

  const handleBuyVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setError('')
    setSuccess('')
    setPaymentUrl('')
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVoucher) return

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      let response

      if (orderData.paymentMethod === 'tripay' && orderData.tripayChannel) {
        // Create Tripay transaction
        response = await fetch('/api/tripay/transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            voucherId: selectedVoucher.id,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            paymentMethod: orderData.tripayChannel,
          }),
        })

        const data = await response.json()
        
        if (data.success) {
          setPaymentUrl(data.data.paymentUrl)
          setSuccess('Transaksi berhasil dibuat! Anda akan diarahkan ke halaman pembayaran.')
          
          // Redirect to payment URL after 2 seconds
          setTimeout(() => {
            window.open(data.data.paymentUrl, '_blank')
          }, 2000)
        } else {
          setError(data.error || 'Gagal membuat transaksi')
        }
      } else {
        // Create regular transaction
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            voucherId: selectedVoucher.id,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            paymentMethod: orderData.paymentMethod,
          }),
        })

        const data = await response.json()
        
        if (response.ok) {
          setSuccess('Pesanan berhasil dibuat! Silakan lakukan pembayaran.')
          setSelectedVoucher(null)
          setOrderData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            paymentMethod: '',
            tripayChannel: ''
          })
        } else {
          setError(data.error || 'Gagal membuat pesanan')
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'qris':
        return <QrCode className="h-4 w-4" />
      case 'transfer':
        return <Building className="h-4 w-4" />
      case 'ewallet':
        return <Smartphone className="h-4 w-4" />
      case 'tripay':
        return <Globe className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'qris':
        return 'QRIS'
      case 'transfer':
        return 'Transfer Bank'
      case 'ewallet':
        return 'E-Wallet'
      case 'tripay':
        return 'Tripay Payment Gateway'
      default:
        return method
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">WiFi Voucher</h1>
              <p className="text-gray-400 mt-1">Pilih voucher WiFi yang sesuai untuk Anda</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="px-6 py-4">
          <Alert className="bg-red-900/20 border-red-800 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {success && (
        <div className="px-6 py-4">
          <Alert className="bg-green-900/20 border-green-800 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Vouchers Grid */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <Card key={voucher.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{voucher.name}</CardTitle>
                    {voucher.popular && (
                      <Badge className="bg-yellow-400 text-black">
                        <Star className="h-3 w-3 mr-1" />
                        Populer
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    {voucher.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{voucher.duration}</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">
                        Rp {voucher.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                          onClick={() => handleBuyVoucher(voucher)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Beli Sekarang
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle>Pesan Voucher</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Isi data Anda untuk melanjutkan pembelian
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedVoucher && (
                          <form onSubmit={handleSubmitOrder} className="space-y-4">
                            <div className="bg-gray-700/50 p-3 rounded-lg">
                              <h4 className="font-medium">{selectedVoucher.name}</h4>
                              <p className="text-sm text-gray-400">{selectedVoucher.duration}</p>
                              <p className="text-lg font-bold text-yellow-400">
                                Rp {selectedVoucher.price.toLocaleString('id-ID')}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="customerName">Nama Lengkap</Label>
                              <Input
                                id="customerName"
                                value={orderData.customerName}
                                onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
                                placeholder="Masukkan nama lengkap"
                                className="bg-gray-700 border-gray-600"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="customerEmail">Email</Label>
                              <Input
                                id="customerEmail"
                                type="email"
                                value={orderData.customerEmail}
                                onChange={(e) => setOrderData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                placeholder="email@example.com"
                                className="bg-gray-700 border-gray-600"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="customerPhone">Nomor WhatsApp</Label>
                              <Input
                                id="customerPhone"
                                value={orderData.customerPhone}
                                onChange={(e) => setOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                placeholder="08xx-xxxx-xxxx"
                                className="bg-gray-700 border-gray-600"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Metode Pembayaran</Label>
                              <Select
                                value={orderData.paymentMethod}
                                onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value, tripayChannel: '' }))}
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600">
                                  <SelectValue placeholder="Pilih metode pembayaran" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                  {paymentSettings?.qrisEnabled && (
                                    <SelectItem value="qris">
                                      <div className="flex items-center space-x-2">
                                        <QrCode className="h-4 w-4" />
                                        <span>QRIS</span>
                                      </div>
                                    </SelectItem>
                                  )}
                                  {paymentSettings?.transferEnabled && (
                                    <SelectItem value="transfer">
                                      <div className="flex items-center space-x-2">
                                        <Building className="h-4 w-4" />
                                        <span>Transfer Bank</span>
                                      </div>
                                    </SelectItem>
                                  )}
                                  {paymentSettings?.ewalletEnabled && (
                                    <SelectItem value="ewallet">
                                      <div className="flex items-center space-x-2">
                                        <Smartphone className="h-4 w-4" />
                                        <span>E-Wallet</span>
                                      </div>
                                    </SelectItem>
                                  )}
                                  {paymentSettings?.tripayEnabled && (
                                    <SelectItem value="tripay">
                                      <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4" />
                                        <span>Tripay Payment Gateway</span>
                                      </div>
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {orderData.paymentMethod === 'tripay' && (
                              <div className="space-y-2">
                                <Label>Channel Pembayaran</Label>
                                <Select
                                  value={orderData.tripayChannel}
                                  onValueChange={(value) => setOrderData(prev => ({ ...prev, tripayChannel: value }))}
                                >
                                  <SelectTrigger className="bg-gray-700 border-gray-600">
                                    <SelectValue placeholder="Pilih channel pembayaran" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-700 border-gray-600 max-h-60 overflow-y-auto">
                                    {tripayChannels.map((channel) => (
                                      <SelectItem key={channel.code} value={channel.code}>
                                        <div className="flex items-center space-x-2">
                                          <span>{channel.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                              disabled={isProcessing || !orderData.customerPhone || !orderData.paymentMethod || (orderData.paymentMethod === 'tripay' && !orderData.tripayChannel)}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                'Buat Pesanan'
                              )}
                            </Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {vouchers.length === 0 && (
            <div className="text-center py-12">
              <Wifi className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">Belum ada voucher tersedia</h3>
              <p className="text-gray-500">Silakan kembali lagi nanti untuk melihat voucher yang tersedia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}