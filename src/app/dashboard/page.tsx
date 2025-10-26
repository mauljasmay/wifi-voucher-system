'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Copy,
  ExternalLink,
  Calendar,
  CreditCard
} from 'lucide-react'

interface Transaction {
  id: string
  voucherId: string
  customerName?: string
  customerEmail?: string
  customerPhone: string
  paymentMethod: string
  amount: number
  status: string
  voucherCode?: string
  tripayReference?: string
  tripayPaymentUrl?: string
  tripayPaymentChannel?: string
  tripayPaymentMethod?: string
  createdAt: string
  updatedAt: string
  voucher: {
    name: string
    duration: string
  }
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchPhone, setSearchPhone] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      if (data.transactions) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Gagal memuat data transaksi')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => 
    transaction.customerPhone.includes(searchPhone)
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      paid: { color: 'bg-green-900/20 border-green-800 text-green-400', text: 'Lunas' },
      pending: { color: 'bg-yellow-900/20 border-yellow-800 text-yellow-400', text: 'Menunggu' },
      failed: { color: 'bg-red-900/20 border-red-800 text-red-400', text: 'Gagal' },
      expired: { color: 'bg-gray-900/20 border-gray-800 text-gray-400', text: 'Kadaluarsa' }
    }
    
    const variant = variants[status] || variants.pending
    
    return (
      <Badge className={variant.color}>
        <div className="flex items-center space-x-1">
          {getStatusIcon(status)}
          <span>{variant.text}</span>
        </div>
      </Badge>
    )
  }

  const getPaymentIcon = (method: string) => {
    if (method.startsWith('TRIPAY_')) {
      return <CreditCard className="h-4 w-4" />
    }
    
    switch (method) {
      case 'qris':
        return <CreditCard className="h-4 w-4" />
      case 'transfer':
        return <CreditCard className="h-4 w-4" />
      case 'ewallet':
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    if (method.startsWith('TRIPAY_')) {
      return method.replace('TRIPAY_', '')
    }
    
    switch (method) {
      case 'qris':
        return 'QRIS'
      case 'transfer':
        return 'Transfer Bank'
      case 'ewallet':
        return 'E-Wallet'
      default:
        return method
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-400 mt-1">Kelola transaksi WiFi voucher Anda</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/vouchers'}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Beli Voucher
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

      {/* Search */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-yellow-400" />
                <span>Cari Transaksi</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Masukkan nomor WhatsApp untuk mencari transaksi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="08xx-xxxx-xxxx"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
                <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Wifi className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">
                    {searchPhone ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchPhone 
                      ? 'Coba periksa kembali nomor WhatsApp yang Anda masukkan'
                      : 'Beli voucher WiFi untuk melihat transaksi Anda di sini'
                    }
                  </p>
                  {!searchPhone && (
                    <Button
                      onClick={() => window.location.href = '/vouchers'}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                    >
                      Beli Voucher Sekarang
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Wifi className="h-5 w-5 text-yellow-400" />
                        <div>
                          <CardTitle className="text-lg">{transaction.voucher.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {transaction.voucher.duration} • {formatDate(transaction.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(transaction.status)}
                        <div className="text-lg font-bold text-yellow-400">
                          Rp {transaction.amount.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Pelanggan:</span>
                        <span>{transaction.customerName || transaction.customerPhone}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">WhatsApp:</span>
                        <span>{transaction.customerPhone}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Metode Pembayaran:</span>
                        <div className="flex items-center space-x-2">
                          {getPaymentIcon(transaction.paymentMethod)}
                          <span>{getPaymentMethodName(transaction.paymentMethod)}</span>
                        </div>
                      </div>
                      
                      {transaction.voucherCode && (
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Kode Voucher:</div>
                              <div className="font-mono font-bold text-yellow-400">
                                {transaction.voucherCode}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(transaction.voucherCode!)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              {copiedCode === transaction.voucherCode ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {transaction.tripayPaymentUrl && transaction.status === 'pending' && (
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Bayar Sekarang:</div>
                              <div className="text-sm text-blue-400">
                                {transaction.tripayPaymentMethod}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => window.open(transaction.tripayPaymentUrl, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Bayar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}