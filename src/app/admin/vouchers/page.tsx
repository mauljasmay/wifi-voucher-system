'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wifi, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Check,
  X,
  Loader2
} from 'lucide-react'

interface Voucher {
  id: string
  name: string
  price: number
  duration: string
  description?: string
  popular: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    popular: false,
    active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/admin/vouchers')
      const data = await response.json()
      if (data.vouchers) {
        setVouchers(data.vouchers)
      }
    } catch (error) {
      setError('Gagal memuat data voucher')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      description: '',
      popular: false,
      active: true
    })
    setEditingVoucher(null)
    setError('')
    setSuccess('')
  }

  const handleAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      name: voucher.name,
      price: voucher.price.toString(),
      duration: voucher.duration,
      description: voucher.description || '',
      popular: voucher.popular,
      active: voucher.active
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const url = editingVoucher 
        ? `/api/admin/vouchers/${editingVoucher.id}`
        : '/api/admin/vouchers'
      
      const method = editingVoucher ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(editingVoucher ? 'Voucher berhasil diperbarui' : 'Voucher berhasil ditambahkan')
        fetchVouchers()
        setTimeout(() => {
          setIsDialogOpen(false)
          resetForm()
        }, 1500)
      } else {
        setError(data.error || 'Gagal menyimpan voucher')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Voucher berhasil dihapus')
        fetchVouchers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Gagal menghapus voucher')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const toggleStatus = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      })

      if (response.ok) {
        fetchVouchers()
      } else {
        setError('Gagal mengubah status voucher')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
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
              <h1 className="text-2xl font-bold">Manajemen Voucher</h1>
              <p className="text-gray-400 mt-1">Kelola voucher WiFi hotspot</p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Voucher
            </Button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="px-6 py-4">
          <Alert className="bg-red-900/20 border-red-800 text-red-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {success && (
        <div className="px-6 py-4">
          <Alert className="bg-green-900/20 border-green-800 text-green-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Vouchers List */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => (
            <Card key={voucher.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{voucher.name}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {voucher.duration}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    {voucher.popular && (
                      <Badge className="bg-yellow-400 text-black">Populer</Badge>
                    )}
                    <Badge variant={voucher.active ? "default" : "secondary"}>
                      {voucher.active ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">
                      Rp {voucher.price.toLocaleString('id-ID')}
                    </p>
                    {voucher.description && (
                      <p className="text-sm text-gray-400 mt-2">{voucher.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 hover:bg-gray-700"
                      onClick={() => handleEdit(voucher)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:bg-gray-700"
                      onClick={() => toggleStatus(voucher.id, !voucher.active)}
                    >
                      {voucher.active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 hover:bg-red-900/20 text-red-400"
                      onClick={() => handleDelete(voucher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {vouchers.length === 0 && (
          <div className="text-center py-12">
            <Wifi className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Belum ada voucher</h3>
            <p className="text-gray-500 mb-4">Tambahkan voucher pertama untuk memulai</p>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Voucher
            </Button>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingVoucher ? 'Perbarui informasi voucher' : 'Isi detail voucher baru'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Voucher</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durasi</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="bg-gray-700 border-gray-600"
                placeholder="contoh: 24 Jam, 7 Hari"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="popular"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700"
              />
              <Label htmlFor="popular">Tandai sebagai populer</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700"
              />
              <Label htmlFor="active">Aktif</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 hover:bg-gray-700"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    {editingVoucher ? 'Perbarui' : 'Tambah'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}