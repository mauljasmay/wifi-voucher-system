'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  plan: string
  status: string
  startDate: string
  endDate?: string
  createdAt: string
}

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, statusFilter, planFilter])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      
      if (data.success) {
        setMembers(data.members)
      } else {
        setError('Gagal memuat data member')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm) ||
        member.plan.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(member => member.plan === planFilter)
    }

    setFilteredMembers(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string; icon: any }> = {
      active: { 
        color: 'bg-green-900/20 border-green-800 text-green-400', 
        text: 'Aktif', 
        icon: CheckCircle 
      },
      inactive: { 
        color: 'bg-gray-900/20 border-gray-800 text-gray-400', 
        text: 'Tidak Aktif', 
        icon: XCircle 
      },
      expired: { 
        color: 'bg-red-900/20 border-red-800 text-red-400', 
        text: 'Kadaluarsa', 
        icon: Clock 
      }
    }
    
    const variant = variants[status] || variants.inactive
    const Icon = variant.icon
    
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.text}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { color: string; text: string; icon: any }> = {
      basic: { 
        color: 'bg-blue-900/20 border-blue-800 text-blue-400', 
        text: 'Basic', 
        icon: Users 
      },
      premium: { 
        color: 'bg-purple-900/20 border-purple-800 text-purple-400', 
        text: 'Premium', 
        icon: Crown 
      },
      business: { 
        color: 'bg-yellow-900/20 border-yellow-800 text-yellow-400', 
        text: 'Business', 
        icon: Crown 
      }
    }
    
    const variant = variants[plan] || variants.basic
    const Icon = variant.icon
    
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.text}
      </Badge>
    )
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

  const isExpired = (endDate?: string) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  const exportToCSV = () => {
    const headers = ['Nama', 'Email', 'Phone', 'Plan', 'Status', 'Start Date', 'End Date', 'Created At']
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        member.name,
        member.email,
        member.phone || '',
        member.plan,
        member.status,
        formatDate(member.startDate),
        member.endDate ? formatDate(member.endDate) : '',
        formatDate(member.createdAt)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `members_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
              <h1 className="text-2xl font-bold flex items-center">
                <Users className="h-6 w-6 mr-2 text-yellow-400" />
                Manajemen Member
              </h1>
              <p className="text-gray-400 mt-1">Kelola data member dan langganan</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={fetchMembers}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
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

      {/* Filters */}
      <div className="p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-yellow-400" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Cari Member</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nama, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="expired">Kadaluarsa</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan">Paket</Label>
                <select
                  id="plan"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">Semua Paket</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Total Member</Label>
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                  <span className="text-yellow-400 font-bold">{filteredMembers.length}</span> member
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <div className="px-6 pb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Daftar Member</CardTitle>
            <CardDescription>
              Menampilkan {filteredMembers.length} dari {members.length} member
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                    ? 'Tidak ada member yang cocok dengan filter' 
                    : 'Belum ada member'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Member yang mendaftar akan muncul di sini'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Member</th>
                      <th className="text-left py-3 px-4">Kontak</th>
                      <th className="text-left py-3 px-4">Paket</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Periode</th>
                      <th className="text-left py-3 px-4">Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-400">{member.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {member.phone && (
                              <div className="flex items-center text-sm text-gray-300">
                                <Phone className="h-3 w-3 mr-1" />
                                {member.phone}
                              </div>
                            )}
                            {member.address && (
                              <div className="flex items-center text-sm text-gray-300">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-xs">{member.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getPlanBadge(member.plan)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-300">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(member.startDate)}
                            </div>
                            {member.endDate && (
                              <div className={`flex items-center ${isExpired(member.endDate) ? 'text-red-400' : 'text-gray-400'}`}>
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(member.endDate)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-300">
                            {formatDate(member.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}