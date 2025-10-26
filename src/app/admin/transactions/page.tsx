'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye
} from 'lucide-react'

interface Transaction {
  id: string
  voucherId: string
  customerName?: string
  customerEmail?: string
  customerPhone: string
  paymentMethod: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
  voucherCode?: string
  createdAt: string
  updatedAt: string
  voucher: {
    name: string
    duration: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page, statusFilter])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/transactions?${params}`)
      const data = await response.json()

      if (data.transactions) {
        setTransactions(data.transactions)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (transactionId: string, status: string, code?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          ...(code && { voucherCode: code })
        }),
      })

      if (response.ok) {
        fetchTransactions()
        setSelectedTransaction(null)
        setVoucherCode('')
      }
    } catch (error) {
      console.error('Failed to update transaction:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/20 border-green-800 text-green-400'
      case 'pending':
        return 'bg-yellow-900/20 border-yellow-800 text-yellow-400'
      case 'cancelled':
        return 'bg-red-900/20 border-red-800 text-red-400'
      default:
        return 'bg-gray-900/20 border-gray-800 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customerPhone.includes(searchTerm) ||
    transaction.voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manajemen Transaksi</h1>
              <p className="text-gray-400 mt-1">Kelola transaksi voucher WiFi</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <main className="p-6">
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{transaction.voucher.name}</h3>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize">{transaction.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Pelanggan</p>
                        <p className="font-medium">
                          {transaction.customerName || transaction.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">WhatsApp</p>
                        <p className="font-medium">{transaction.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Pembayaran</p>
                        <p className="font-medium capitalize">{transaction.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-medium text-yellow-400">
                          Rp {transaction.amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {transaction.voucherCode && (
                      <div className="mt-3 p-2 bg-gray-700 rounded">
                        <p className="text-xs text-gray-400">Kode Voucher:</p>
                        <p className="font-mono font-bold text-green-400">{transaction.voucherCode}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(transaction.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:bg-gray-700"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                    
                    {transaction.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(transaction.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Konfirmasi
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 hover:bg-red-900/20 text-red-400"
                          onClick={() => handleUpdateStatus(transaction.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Batal
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Tidak ada transaksi</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tidak ada transaksi yang cocok dengan filter' 
                : 'Belum ada transaksi yang dilakukan'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informasi lengkap transaksi
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">ID Transaksi</p>
                  <p className="font-mono text-xs">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedTransaction.status)}
                      <span className="capitalize">{selectedTransaction.status}</span>
                    </div>
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400">Voucher</p>
                  <p className="font-medium">{selectedTransaction.voucher.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Durasi</p>
                  <p className="font-medium">{selectedTransaction.voucher.duration}</p>
                </div>
                <div>
                  <p className="text-gray-400">Nama Pelanggan</p>
                  <p className="font-medium">{selectedTransaction.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="font-medium">{selectedTransaction.customerEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400">WhatsApp</p>
                  <p className="font-medium">{selectedTransaction.customerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-400">Metode Pembayaran</p>
                  <p className="font-medium capitalize">{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Harga</p>
                  <p className="font-medium text-yellow-400">
                    Rp {selectedTransaction.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Tanggal</p>
                  <p className="font-medium">
                    {new Date(selectedTransaction.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {selectedTransaction.voucherCode && (
                <div className="p-3 bg-gray-700 rounded">
                  <p className="text-sm text-gray-400 mb-1">Kode Voucher:</p>
                  <p className="font-mono font-bold text-green-400 text-lg">
                    {selectedTransaction.voucherCode}
                  </p>
                </div>
              )}

              {selectedTransaction.status === 'pending' && (
                <div className="space-y-3 pt-3 border-t border-gray-700">
                  <div className="space-y-2">
                    <Label htmlFor="voucherCode">Kode Voucher (opsional)</Label>
                    <Input
                      id="voucherCode"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Masukkan kode voucher"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateStatus(selectedTransaction.id, 'completed', voucherCode)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Konfirmasi
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-600 hover:bg-red-900/20 text-red-400"
                      onClick={() => handleUpdateStatus(selectedTransaction.id, 'cancelled')}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}