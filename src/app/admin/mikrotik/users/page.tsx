'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Wifi, 
  Activity,
  Search,
  RefreshCw,
  Loader2,
  UserCheck,
  UserX,
  Clock,
  Database,
  TrendingUp,
  Filter
} from 'lucide-react';

interface MikroTikUser {
  name: string;
  password?: string;
  profile: string;
  uptime?: string;
  bytesIn?: number;
  bytesOut?: number;
  bytesInCom?: number;
  bytesOutCom?: number;
  packetIn?: number;
  packetOut?: number;
  packetInCom?: number;
  packetOutCom?: number;
  limitBytesIn?: number;
  limitBytesOut?: number;
  limitBytesTotal?: number;
  limitUptime?: string;
  comment?: string;
  disabled?: boolean;
  '.id'?: string;
}

interface MikroTikProfile {
  name: string;
  rateLimit?: string;
  actualRateIn?: string;
  actualRateOut?: string;
  priority?: number;
  parent?: string;
  comment?: string;
}

export default function MikroTikUsers() {
  const { admin, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<MikroTikUser[]>([]);
  const [profiles, setProfiles] = useState<MikroTikProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    fetchUsers();
    fetchProfiles();
  }, [isAuthenticated, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/mikrotik/users?active=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Gagal mengambil data user MikroTik');
      }
    } catch (error) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/mikrotik/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    setError('');
    await fetchUsers();
    await fetchProfiles();
    setRefreshing(false);
  };

  const deleteUser = async (username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    setDeletingUser(username);
    setError('');

    try {
      const response = await fetch('/api/mikrotik/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter(user => user.name !== username));
      } else {
        setError(data.error || 'Gagal menghapus user');
      }
    } catch (error) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setDeletingUser(null);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (uptime?: string) => {
    if (!uptime) return '0s';
    return uptime;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.comment && user.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProfile = filterProfile === 'all' || user.profile === filterProfile;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !user.disabled) ||
                         (filterStatus === 'disabled' && user.disabled);
    
    return matchesSearch && matchesProfile && matchesStatus;
  });

  const getStatusBadge = (user: MikroTikUser) => {
    if (user.disabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (user.uptime && user.uptime !== '0s') {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    return <Badge variant="outline">Idle</Badge>;
  };

  const getDataUsagePercentage = (user: MikroTikUser) => {
    if (!user.limitBytesTotal) return 0;
    const used = (user.bytesIn || 0) + (user.bytesOut || 0);
    return Math.min((used / user.limitBytesTotal) * 100, 100);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/mikrotik')}
                className="mr-4"
              >
                ← MikroTik
              </Button>
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                  <p className="text-sm text-gray-500">Monitor dan kelola user hotspot</p>
                </div>
              </div>
            </div>
            
            <Button onClick={refreshData} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {users.filter(user => user.uptime && user.uptime !== '0s').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-50">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Idle Users</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {users.filter(user => !user.uptime || user.uptime === '0s').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profiles</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{profiles.length}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari user atau comment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterProfile} onValueChange={setFilterProfile}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Profile</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.name} value={profile.name}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada user ditemukan</h3>
                  <p className="text-gray-500 text-center">
                    {searchTerm || filterProfile !== 'all' || filterStatus !== 'all'
                      ? 'Coba ubah filter atau kata kunci pencarian'
                      : 'Belum ada user yang terhubung ke hotspot'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                          <Wifi className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                            {getStatusBadge(user)}
                          </div>
                          <p className="text-sm text-gray-500">Profile: {user.profile}</p>
                          {user.comment && (
                            <p className="text-sm text-gray-500 mt-1">{user.comment}</p>
                          )}
                          
                          {/* Data Usage */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Data Usage:</span>
                              <span className="font-medium">
                                {formatBytes((user.bytesIn || 0) + (user.bytesOut || 0))}
                                {user.limitBytesTotal && ` / ${formatBytes(user.limitBytesTotal)}`}
                              </span>
                            </div>
                            
                            {user.limitBytesTotal && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    getDataUsagePercentage(user) > 80 ? 'bg-red-500' : 
                                    getDataUsagePercentage(user) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${getDataUsagePercentage(user)}%` }}
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Uptime:</span>
                              <span className="font-medium">{formatUptime(user.uptime)}</span>
                            </div>
                            
                            {user.limitUptime && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Time Limit:</span>
                                <span className="font-medium">{user.limitUptime}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user.name)}
                          disabled={deletingUser === user.name}
                        >
                          {deletingUser === user.name ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}