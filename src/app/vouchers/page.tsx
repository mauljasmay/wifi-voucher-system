'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Wifi, 
  Clock, 
  Star, 
  ShoppingCart,
  QrCode,
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

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchVouchers()
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

  const handleBuyVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setError('')
    setSuccess('')
    setPaymentUrl('')
    setCustomerPhone('')
    
    // Auto-focus phone input when dialog opens
    setTimeout(() => {
      phoneInputRef.current?.focus()
    }, 100)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVoucher || !customerPhone) return

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      // Always use QRIS payment
      const response = await fetch('/api/tripay/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedVoucher.price,
          phone: customerPhone,
          packageName: selectedVoucher.name,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setPaymentUrl(data.data.pay_url)
        setSuccess('Pembayaran QRIS berhasil dibuat! Anda akan diarahkan ke halaman pembayaran.')
        
        // Redirect to payment URL after 2 seconds
        setTimeout(() => {
          window.open(data.data.pay_url, '_blank')
          // Reset form after redirect
          setSelectedVoucher(null)
          setCustomerPhone('')
        }, 2000)
      } else {
        setError(data.error || 'Gagal membuat pembayaran QRIS')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Auto-submit when phone number is entered (minimum 10 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value
    setCustomerPhone(phone)
    
    // Auto-submit when phone number has at least 10 digits
    if (phone.length >= 10 && selectedVoucher && !isProcessing) {
      setTimeout(() => {
        if (phone.length >= 10) { // Double check phone still has 10+ digits
          handleSubmitOrder(e as any)
        }
      }, 500)
    }
  }

  // Close dialog and reset state
  const closeDialog = () => {
    setSelectedVoucher(null)
    setCustomerPhone('')
    setError('')
    setSuccess('')
    setPaymentUrl('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat voucher...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
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
          {vouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.map((voucher) => (
                <Card key={voucher.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10">
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
                      
                      <Dialog open={!!selectedVoucher} onOpenChange={(open) => !open && closeDialog()}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                            onClick={() => handleBuyVoucher(voucher)}
                            disabled={isProcessing}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Beli Sekarang
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                          <DialogHeader>
                            <DialogTitle>Pesan Voucher</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Masukkan nomor WhatsApp untuk pembayaran QRIS otomatis
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedVoucher && (
                            <form onSubmit={handleSubmitOrder} className="space-y-4">
                              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <h4 className="font-medium text-lg">{selectedVoucher.name}</h4>
                                <p className="text-sm text-gray-400">{selectedVoucher.duration}</p>
                                <p className="text-xl font-bold text-yellow-400 mt-2">
                                  Rp {selectedVoucher.price.toLocaleString('id-ID')}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customerPhone" className="text-sm font-medium">
                                  Nomor WhatsApp
                                </Label>
                                <Input
                                  ref={phoneInputRef}
                                  id="customerPhone"
                                  type="tel"
                                  value={customerPhone}
                                  onChange={handlePhoneChange}
                                  placeholder="08xx-xxxx-xxxx"
                                  className="bg-gray-700 border-gray-600 text-lg h-12 focus:border-yellow-400 focus:ring-yellow-400"
                                  required
                                  disabled={isProcessing}
                                />
                                <p className="text-sm text-gray-400">
                                  Masukkan nomor WhatsApp, pembayaran QRIS akan otomatis diproses
                                </p>
                              </div>

                              {/* Payment method - Auto QRIS */}
                              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <QrCode className="h-5 w-5 text-yellow-400" />
                                  <span className="font-medium text-yellow-400">
                                    Pembayaran QRIS Otomatis
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">
                                  Pembayaran akan otomatis menggunakan QRIS setelah Anda memasukkan nomor WhatsApp
                                </p>
                              </div>

                              {/* Hidden submit button - form auto-submits */}
                              <Button
                                type="submit"
                                className="hidden"
                                disabled={isProcessing || !customerPhone}
                              />

                              {/* Processing indicator */}
                              {isProcessing && (
                                <div className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg flex items-center justify-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Membuat Pembayaran QRIS...</span>
                                </div>
                              )}

                              {/* Success state with payment URL */}
                              {paymentUrl && !isProcessing && (
                                <div className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Mengarahkan ke pembayaran...</span>
                                </div>
                              )}
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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