'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Wifi, ArrowRight, Smartphone, Clock, MessageCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reference) {
      fetchPaymentDetails()
    }
  }, [reference])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/tripay/payment?reference=${reference}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Memuat detail pembayaran...</p>
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pembayaran Berhasil!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Terima kasih telah melakukan pembelian voucher WiFi MLJ-NET. Voucher Anda telah dikirim ke nomor WhatsApp.
            </p>
            
            {/* Payment Details */}
            {paymentData && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detail Pembayaran</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reference</span>
                    <span className="font-medium text-gray-900 dark:text-white">{paymentData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className="font-medium text-green-600 dark:text-green-400">LUNAS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Jumlah</span>
                    <span className="font-medium text-gray-900 dark:text-white">Rp {paymentData.amount?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Voucher Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 mr-2" />
                <span className="text-lg font-semibold">Voucher Dikirim via WhatsApp</span>
              </div>
              <p className="text-sm opacity-90">
                Periksa WhatsApp Anda untuk menerima kode voucher dan instruksi penggunaan
              </p>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Cara Penggunaan Voucher:</h3>
              <ol className="text-left text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  <span>Hubungkan ke WiFi "MLJ-NET"</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  <span>Browser akan otomatis membuka halaman login</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  <span>Masukkan kode voucher yang Anda terima via WhatsApp</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">4.</span>
                  <span>Klik "Login" dan nikmati internet Anda</span>
                </li>
              </ol>
            </div>
            
            {/* Support Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center mb-2">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-white">Butuh Bantuan?</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hubungi kami via WhatsApp: 0812-3456-7890
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = '/voucher'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Beli Voucher Lagi
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}