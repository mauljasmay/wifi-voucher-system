'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  Wifi, 
  WifiOff,
  Settings,
  TestTube,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Activity,
  Shield
} from 'lucide-react';

interface MikroTikSettings {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  version: string;
  useSSL: boolean;
  timeout: number;
  isActive: boolean;
  hotspotInterface?: string;
  hotspotName?: string;
  defaultProfile?: string;
  connectionStatus: string;
  lastConnected?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
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

export default function MikroTikManagement() {
  const { admin, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<MikroTikSettings[]>([]);
  const [profiles, setProfiles] = useState<MikroTikProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    host: '',
    port: 8728,
    username: '',
    password: '',
    version: 'v6',
    useSSL: false,
    timeout: 10000,
    isActive: true,
    hotspotInterface: '',
    hotspotName: '',
    defaultProfile: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    fetchSettings();
    fetchProfiles();
  }, [isAuthenticated, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/mikrotik/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        setError('Gagal mengambil pengaturan MikroTik');
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
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    }
  };

  const handleCreateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreateLoading(true);

    try {
      const response = await fetch('/api/mikrotik/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Pengaturan MikroTik berhasil disimpan');
        setShowCreateDialog(false);
        setCreateForm({
          name: '',
          host: '',
          port: 8728,
          username: '',
          password: '',
          version: 'v6',
          useSSL: false,
          timeout: 10000,
          isActive: true,
          hotspotInterface: '',
          hotspotName: '',
          defaultProfile: ''
        });
        fetchSettings();
        fetchProfiles();
      } else {
        setError(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setCreateLoading(false);
    }
  };

  const testConnection = async (settingsId: string) => {
    setTestingConnection(settingsId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/mikrotik/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settingsId })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Koneksi MikroTik berhasil!');
        fetchSettings();
        fetchProfiles();
      } else {
        setError('Koneksi MikroTik gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setTestingConnection(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">Terhubung</Badge>;
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="secondary">Belum Test</Badge>;
    }
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
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4"
              >
                ← Dashboard
              </Button>
              <div className="flex items-center">
                <Server className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">MikroTik Management</h1>
                  <p className="text-sm text-gray-500">Kelola integrasi RouterOS</p>
                </div>
              </div>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah MikroTik
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Pengaturan MikroTik</DialogTitle>
                  <DialogDescription>
                    Konfigurasi koneksi ke RouterOS MikroTik
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSettings} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                        placeholder="Contoh: Office Router"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="host">Host/IP</Label>
                      <Input
                        id="host"
                        value={createForm.host}
                        onChange={(e) => setCreateForm({...createForm, host: e.target.value})}
                        placeholder="192.168.1.1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        value={createForm.port}
                        onChange={(e) => setCreateForm({...createForm, port: parseInt(e.target.value)})}
                        min={1}
                        max={65535}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="version">Versi</Label>
                      <Select 
                        value={createForm.version} 
                        onValueChange={(value) => setCreateForm({...createForm, version: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v6">RouterOS v6</SelectItem>
                          <SelectItem value="v7">RouterOS v7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={createForm.username}
                        onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                        placeholder="admin"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotspotInterface">Interface Hotspot</Label>
                      <Input
                        id="hotspotInterface"
                        value={createForm.hotspotInterface}
                        onChange={(e) => setCreateForm({...createForm, hotspotInterface: e.target.value})}
                        placeholder="ether1, wlan1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultProfile">Profile Default</Label>
                      <Select 
                        value={createForm.defaultProfile} 
                        onValueChange={(value) => setCreateForm({...createForm, defaultProfile: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.name} value={profile.name}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useSSL"
                      checked={createForm.useSSL}
                      onCheckedChange={(checked) => setCreateForm({...createForm, useSSL: checked})}
                    />
                    <Label htmlFor="useSSL">Gunakan SSL</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={createForm.isActive}
                      onCheckedChange={(checked) => setCreateForm({...createForm, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Server className="w-4 h-4 mr-2" />
                        Simpan Pengaturan
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
        
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {settings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Server className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengaturan MikroTik</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Tambahkan pengaturan MikroTik untuk mulai mengintegrasikan voucher hotspot
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengaturan Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              settings.map((setting) => (
                <Card key={setting.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                          {setting.connectionStatus === 'connected' ? (
                            <Wifi className="w-6 h-6 text-green-600" />
                          ) : (
                            <WifiOff className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {setting.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {setting.host}:{setting.port} ({setting.version})
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(setting.connectionStatus)}
                            <Badge variant={setting.isActive ? 'default' : 'secondary'}>
                              {setting.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                            {setting.useSSL && (
                              <Badge variant="outline">SSL</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(setting.id)}
                          disabled={testingConnection === setting.id}
                        >
                          {testingConnection === setting.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                          Test
                        </Button>
                      </div>
                    </div>
                    
                    {setting.errorMessage && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{setting.errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    
                    {setting.lastConnected && (
                      <div className="mt-4 text-sm text-gray-500">
                        Terhubung terakhir: {new Date(setting.lastConnected).toLocaleString('id-ID')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
            
            {/* Available Profiles */}
            {profiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Profile Hotspot Tersedia
                  </CardTitle>
                  <CardDescription>
                    Daftar profile hotspot yang tersedia di MikroTik
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {profiles.map((profile) => (
                      <div key={profile.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          {profile.rateLimit && (
                            <p className="text-sm text-gray-500">Rate Limit: {profile.rateLimit}</p>
                          )}
                          {profile.comment && (
                            <p className="text-sm text-gray-500">{profile.comment}</p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {profile.parent || 'Default'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}