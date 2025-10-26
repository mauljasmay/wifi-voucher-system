'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Wifi, 
  Settings, 
  CreditCard, 
  FileText, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

interface AdminData {
  id: string
  email: string
  name: string
  role: string
}

interface DashboardStats {
  totalVouchers: number
  activeVouchers: number
  totalTransactions: number
  pendingTransactions: number
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  todayRevenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalVouchers: 0,
    activeVouchers: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    todayRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/vouchers', icon: Wifi, label: 'Voucher' },
    { href: '/admin/transactions', icon: FileText, label: 'Transaksi' },
    { href: '/admin/members', icon: Users, label: 'Member' },
    { href: '/admin/settings', icon: Settings, label: 'Pengaturan Website' },
    { href: '/admin/payments', icon: CreditCard, label: 'Pengaturan Pembayaran' },
  ]

  useEffect(() => {
    fetchAdminData()
    fetchDashboardStats()
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      const data = await response.json()
      if (data.success) {
        setAdmin(data.admin)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // Fetch vouchers
      const vouchersResponse = await fetch('/api/admin/vouchers')
      const vouchersData = await vouchersResponse.json()
      
      // Fetch transactions
      const transactionsResponse = await fetch('/api/admin/transactions')
      const transactionsData = await transactionsResponse.json()

      // Fetch members
      const membersResponse = await fetch('/api/members')
      const membersData = await membersResponse.json()

      if (vouchersData.vouchers && transactionsData.transactions) {
        const vouchers = vouchersData.vouchers
        const transactions = transactionsData.transactions
        const members = membersData.members || []

        const totalRevenue = transactions
          .filter(t => t.status === 'completed')
          .reduce((sum: number, t: any) => sum + t.amount, 0)

        const todayRevenue = transactions
          .filter(t => {
            const transactionDate = new Date(t.createdAt).toDateString()
            const today = new Date().toDateString()
            return transactionDate === today && t.status === 'completed'
          })
          .reduce((sum: number, t: any) => sum + t.amount, 0)

        const activeMembers = members.filter((m: any) => {
          const endDate = m.endDate ? new Date(m.endDate) : null
          return m.status === 'active' && (!endDate || endDate > new Date())
        }).length

        setStats({
          totalVouchers: vouchers.length,
          activeVouchers: vouchers.filter((v: any) => v.active).length,
          totalTransactions: transactions.length,
          pendingTransactions: transactions.filter((t: any) => t.status === 'pending').length,
          totalMembers: members.length,
          activeMembers,
          totalRevenue,
          todayRevenue
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
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
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Wifi className="h-8 w-8 text-yellow-400" />
            <span className="text-xl font-bold">MLJ-NET</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Welcome back, {admin?.name}
              </span>
              <Badge variant="secondary">{admin?.role}</Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-2">Ringkasan statistik dan aktivitas terkini</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Voucher</CardTitle>
                <Wifi className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVouchers}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.activeVouchers} aktif
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Member</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.activeMembers} aktif
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Transaksi</CardTitle>
                <FileText className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.pendingTransactions} menunggu konfirmasi
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Pendapatan</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
                <p className="text-xs text-gray-400 mt-1">
                  Hari ini: Rp {stats.todayRevenue.toLocaleString('id-ID')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  <span>Aksi Cepat</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Akses cepat ke fitur yang sering digunakan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/vouchers">
                  <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700">
                    <Wifi className="h-4 w-4 mr-2" />
                    Tambah Voucher Baru
                  </Button>
                </Link>
                <Link href="/admin/members">
                  <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700">
                    <Users className="h-4 w-4 mr-2" />
                    Kelola Member
                  </Button>
                </Link>
                <Link href="/admin/transactions">
                  <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Lihat Transaksi Terbaru
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan Website
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span>Informasi Admin</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Detail akun admin Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nama:</span>
                    <span>{admin?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span>{admin?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <Badge variant="secondary">{admin?.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}