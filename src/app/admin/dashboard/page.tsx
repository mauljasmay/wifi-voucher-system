'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Wifi, 
  CreditCard, 
  Settings, 
  LogOut,
  Shield,
  UserPlus,
  Activity,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalVouchers: number;
  totalTransactions: number;
  activeUsers: number;
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const { admin, isAuthenticated, isSuperAdmin, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVouchers: 0,
    totalTransactions: 0,
    activeUsers: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardStats();
  }, [isAuthenticated, router]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await fetch('/api/users');
      const usersData = usersResponse.ok ? await usersResponse.json() : { users: [] };
      
      // Fetch vouchers
      const vouchersResponse = await fetch('/api/vouchers');
      const vouchersData = vouchersResponse.ok ? await vouchersResponse.json() : { vouchers: [] };
      
      // Fetch transactions
      const transactionsResponse = await fetch('/api/transactions');
      const transactionsData = transactionsResponse.ok ? await transactionsResponse.json() : { transactions: [] };

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalVouchers: vouchersData.vouchers?.length || 0,
        totalTransactions: transactionsData.transactions?.length || 0,
        activeUsers: usersData.users?.filter((u: any) => u.status === 'active').length || 0,
        recentTransactions: transactionsData.transactions?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !admin) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Member',
      value: stats.totalUsers,
      description: 'Semua pengguna terdaftar',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Member Aktif',
      value: stats.activeUsers,
      description: 'Pengguna dengan status aktif',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Voucher Tersedia',
      value: stats.totalVouchers,
      description: 'Paket voucher WiFi',
      icon: Wifi,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Transaksi',
      value: stats.totalTransactions,
      description: 'Semua transaksi',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">MLJ-NET Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <Badge variant={admin.role === 'SUPER_ADMIN' ? 'destructive' : 'secondary'}>
                  {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Selamat datang, {admin.name}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola bisnis WiFi hotspot Anda dari dashboard ini
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Aksi cepat untuk mengelola sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/vouchers')}
              >
                <Wifi className="w-4 h-4 mr-2" />
                Kelola Voucher
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="w-4 h-4 mr-2" />
                Kelola Member
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/transactions')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Lihat Transaksi
              </Button>
              {isSuperAdmin && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/admins')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Kelola Admin
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Transaksi terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{transaction.customerName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Rp {transaction.amount.toLocaleString()}</p>
                        <Badge variant={transaction.status === 'success' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}