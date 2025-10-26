'use client'

import { useState, useEffect } from 'react'
import { Wifi, Clock, CheckCircle, ArrowRight, Smartphone, QrCode, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const voucherPackages = [
  {
    id: '1-hour',
    name: '1 Jam',
    price: 5000,
    duration: '1 jam',
    features: ['Akses WiFi cepat', 'Tanpa batasan kuota', 'Support 24/7'],
    popular: false
  },
  {
    id: '6-hours',
    name: '6 Jam',
    price: 25000,
    duration: '6 jam',
    features: ['Akses WiFi cepat', 'Tanpa batasan kuota', 'Support 24/7', 'Hemat 20%'],
    popular: false
  },
  {
    id: '24-hours',
    name: '24 Jam',
    price: 50000,
    duration: '24 jam',
    features: ['Akses WiFi cepat', 'Tanpa batasan kuota', 'Support 24/7', 'Hemat 50%', 'Valid 1 hari penuh'],
    popular: true
  },
  {
    id: '3-days',
    name: '3 Hari',
    price: 100000,
    duration: '3 hari',
    features: ['Akses WiFi cepat', 'Tanpa batasan kuota', 'Support 24/7', 'Hemat 60%', 'Valid 3 hari'],
    popular: false
  }
]

export default function VoucherPage() {
  const [selectedPackage, setSelectedPackage] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    phone: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const selectedVoucher = voucherPackages.find(p => p.id === selectedPackage)

  // Countdown timer for payment expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and +62 prefix
    if (value === '' || value.startsWith('+62') || /^[0-9]*$/.test(value)) {
      setCustomerInfo({
        ...customerInfo,
        [e.target.name]: value
      })
    }
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone
    if (phone.startsWith('0')) {
      return '+62' + phone.slice(1)
    }
    if (!phone.startsWith('+62')) {
      return '+62' + phone
    }
    return phone
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPackage || !customerInfo.phone) {
      setError('Mohon pilih paket dan masukkan nomor WhatsApp')
      return
    }

    // Validate phone number
    const phone = formatPhoneNumber(customerInfo.phone)
    if (phone.length < 10) {
      setError('Nomor WhatsApp tidak valid')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/tripay/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedVoucher?.price,
          phone: phone,
          packageName: selectedVoucher?.name
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentData(data.data)
        setShowPayment(true)
        
        // Set countdown (24 hours in seconds)
        const expiryTime = Math.floor((new Date(data.data.expired_at).getTime() - Date.now()) / 1000)
        setCountdown(Math.max(0, expiryTime))
      } else {
        setError(data.error || 'Pembayaran gagal. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Payment creation failed:', error)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const checkPaymentStatus = async () => {
    if (!paymentData?.reference) return

    try {
      const response = await fetch(`/api/tripay/payment?reference=${paymentData.reference}`)
      const data = await response.json()

      if (response.ok && data.success) {
        if (data.data.status === 'PAID') {
          // Payment successful - redirect to success page
          window.location.href = `/voucher/success?reference=${paymentData.reference}`
        } else if (data.data.status === 'EXPIRED') {
          setError('Pembayaran telah kadaluarsar. Silakan coba lagi.')
          setShowPayment(false)
        }
      }
    } catch (error) {
      console.error('Payment status check failed:', error)
    }
  }

  // Auto-check payment status every 5 seconds
  useEffect(() => {
    if (showPayment && paymentData?.reference) {
      const interval = setInterval(checkPaymentStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [showPayment, paymentData])

  if (showPayment && paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <Header />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Scan QRIS untuk Pembayaran
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Selesaikan pembayaran dalam {formatCountdown(countdown)}
                </p>
              </div>

              {/* QR Code Display */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                <div className="aspect-square bg-white rounded-lg p-4 max-w-sm mx-auto">
                  {/* In production, this would display the actual QR code */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">QR Code akan muncul di sini</p>
                      <p className="text-xs text-gray-400 mt-2">Reference: {paymentData.reference}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detail Pembayaran</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paket</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedVoucher?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nomor WhatsApp</span>
                    <span className="font-medium text-gray-900 dark:text-white">{customerInfo.phone}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Rp {selectedVoucher?.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Cara Pembayaran:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Scan QR Code dengan aplikasi e-wallet (GoPay, OVO, Dana, dll)</li>
                      <li>Masukkan jumlah pembayaran yang tepat</li>
                      <li>Konfirmasi pembayaran</li>
                      <li>Voucher akan dikirim otomatis via WhatsApp setelah pembayaran berhasil</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={checkPaymentStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cek Status Pembayaran
                </button>
                <button
                  onClick={() => {
                    setShowPayment(false)
                    setPaymentData(null)
                    setCountdown(0)
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batalkan
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pesan Voucher WiFi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Isi data Anda untuk melanjutkan pembelian
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Paket Voucher */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pilih Paket Voucher</h2>
            <div className="space-y-4">
              {voucherPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg.id)}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'ring-2 ring-blue-600 dark:ring-blue-400 shadow-lg'
                      : 'hover:shadow-md dark:hover:bg-gray-700'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        PALING POPULER
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline mb-3">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">Rp {pkg.price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">Berlaku {pkg.duration}</span>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="ml-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPackage === pkg.id
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedPackage === pkg.id && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Pembelian */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Pembeli</h2>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0812-3456-7890"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Voucher akan dikirim ke nomor ini setelah pembayaran berhasil
                  </p>
                </div>
              </div>

              {/* Ringkasan Pembelian */}
              {selectedVoucher && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ringkasan Pembelian</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paket</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedVoucher.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Durasi</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedVoucher.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Metode Pembayaran</span>
                      <span className="font-medium text-gray-900 dark:text-white">QRIS</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">Rp {selectedVoucher.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Info */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Pembayaran QRIS</p>
                    <p>Scan QR code dengan aplikasi e-wallet (GoPay, OVO, Dana, ShopeePay, dll)</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedPackage || !customerInfo.phone || isProcessing}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    Bayar dengan QRIS
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Pembayaran Aman
                </div>
                <div className="flex items-center">
                  <Smartphone className="w-4 h-4 mr-1" />
                  Support 24/7
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Mengapa Pilih Voucher MLJ-NET?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Internet Cepat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kecepatan hingga 100 Mbps untuk streaming, gaming, dan browsing tanpa hambatan
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Aktif Instan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voucher langsung aktif setelah pembayaran, tidak perlu menunggu
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Aman & Terpercaya</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Koneksi terenkripsi dan support teknis 24 jam untuk membantu Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}