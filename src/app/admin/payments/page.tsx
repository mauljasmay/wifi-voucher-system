'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Save,
  Loader2,
  QrCode,
  Smartphone,
  Building,
  Globe
} from 'lucide-react'

interface PaymentSettings {
  id: string
  qrisEnabled: boolean
  qrisImageUrl?: string
  transferEnabled: boolean
  bankName?: string
  bankAccount?: string
  bankNumber?: string
  ewalletEnabled: boolean
  goPayNumber?: string
  ovoNumber?: string
  danaNumber?: string
  linkAjaNumber?: string
  // Tripay Settings
  tripayEnabled: boolean
  tripayApiKey?: string
  tripayPrivateKey?: string
  tripayMerchantCode?: string
  tripayMode: string
}

export default function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>({
    id: '',
    qrisEnabled: true,
    qrisImageUrl: '',
    transferEnabled: true,
    bankName: '',
    bankAccount: '',
    bankNumber: '',
    ewalletEnabled: true,
    goPayNumber: '',
    ovoNumber: '',
    danaNumber: '',
    linkAjaNumber: '',
    // Tripay Settings
    tripayEnabled: false,
    tripayApiKey: '',
    tripayPrivateKey: '',
    tripayMerchantCode: '',
    tripayMode: 'SANDBOX'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      setError('Gagal memuat pengaturan pembayaran')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Pengaturan pembayaran berhasil disimpan')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Gagal menyimpan pengaturan pembayaran')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSwitchChange = (field: keyof PaymentSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof PaymentSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
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
              <h1 className="text-2xl font-bold">Pengaturan Pembayaran</h1>
              <p className="text-gray-400 mt-1">Kelola metode pembayaran yang tersedia</p>
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

      {success && (
        <div className="px-6 py-4">
          <Alert className="bg-green-900/20 border-green-800 text-green-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Settings Form */}
      <main className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* QRIS Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-yellow-400" />
                <span>QRIS</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan pembayaran QRIS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="qrisEnabled">Aktifkan QRIS</Label>
                  <p className="text-sm text-gray-400">
                    Izinkan pembayaran menggunakan QR Code
                  </p>
                </div>
                <Switch
                  id="qrisEnabled"
                  checked={settings.qrisEnabled}
                  onCheckedChange={(checked) => handleSwitchChange('qrisEnabled', checked)}
                />
              </div>

              {settings.qrisEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="qrisImageUrl">URL Gambar QRIS</Label>
                  <Input
                    id="qrisImageUrl"
                    value={settings.qrisImageUrl || ''}
                    onChange={(e) => handleInputChange('qrisImageUrl', e.target.value)}
                    placeholder="/qris-code.png"
                    className="bg-gray-700 border-gray-600"
                  />
                  <p className="text-xs text-gray-400">
                    Upload gambar QR Code dan masukkan URL-nya di sini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Transfer Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-400" />
                <span>Transfer Bank</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan pembayaran transfer bank
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transferEnabled">Aktifkan Transfer Bank</Label>
                  <p className="text-sm text-gray-400">
                    Izinkan pembayaran melalui transfer bank
                  </p>
                </div>
                <Switch
                  id="transferEnabled"
                  checked={settings.transferEnabled}
                  onCheckedChange={(checked) => handleSwitchChange('transferEnabled', checked)}
                />
              </div>

              {settings.transferEnabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Nama Bank</Label>
                      <Input
                        id="bankName"
                        value={settings.bankName || ''}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        placeholder="BCA, Mandiri, BNI, dll"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Atas Nama</Label>
                      <Input
                        id="bankAccount"
                        value={settings.bankAccount || ''}
                        onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        placeholder="Nama pemilik rekening"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankNumber">Nomor Rekening</Label>
                    <Input
                      id="bankNumber"
                      value={settings.bankNumber || ''}
                      onChange={(e) => handleInputChange('bankNumber', e.target.value)}
                      placeholder="1234567890"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* E-Wallet Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-green-400" />
                <span>E-Wallet</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan pembayaran e-wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ewalletEnabled">Aktifkan E-Wallet</Label>
                  <p className="text-sm text-gray-400">
                    Izinkan pembayaran menggunakan e-wallet
                  </p>
                </div>
                <Switch
                  id="ewalletEnabled"
                  checked={settings.ewalletEnabled}
                  onCheckedChange={(checked) => handleSwitchChange('ewalletEnabled', checked)}
                />
              </div>

              {settings.ewalletEnabled && (
                <div className="space-y-4">
                  <Separator className="bg-gray-700" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goPayNumber">GoPay</Label>
                      <Input
                        id="goPayNumber"
                        value={settings.goPayNumber || ''}
                        onChange={(e) => handleInputChange('goPayNumber', e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ovoNumber">OVO</Label>
                      <Input
                        id="ovoNumber"
                        value={settings.ovoNumber || ''}
                        onChange={(e) => handleInputChange('ovoNumber', e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="danaNumber">DANA</Label>
                      <Input
                        id="danaNumber"
                        value={settings.danaNumber || ''}
                        onChange={(e) => handleInputChange('danaNumber', e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkAjaNumber">LinkAja</Label>
                      <Input
                        id="linkAjaNumber"
                        value={settings.linkAjaNumber || ''}
                        onChange={(e) => handleInputChange('linkAjaNumber', e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tripay Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <span>Tripay Payment Gateway</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan integrasi dengan payment gateway Tripay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tripayEnabled">Aktifkan Tripay</Label>
                  <p className="text-sm text-gray-400">
                    Izinkan pembayaran melalui payment gateway Tripay
                  </p>
                </div>
                <Switch
                  id="tripayEnabled"
                  checked={settings.tripayEnabled}
                  onCheckedChange={(checked) => handleSwitchChange('tripayEnabled', checked)}
                />
              </div>

              {settings.tripayEnabled && (
                <div className="space-y-4">
                  <Separator className="bg-gray-700" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="tripayMode">Mode</Label>
                    <Select
                      value={settings.tripayMode}
                      onValueChange={(value) => handleInputChange('tripayMode', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Pilih mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="SANDBOX">Sandbox (Testing)</SelectItem>
                        <SelectItem value="PRODUCTION">Production</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">
                      Gunakan Sandbox untuk testing, Production untuk live transaksi
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tripayMerchantCode">Kode Merchant</Label>
                    <Input
                      id="tripayMerchantCode"
                      value={settings.tripayMerchantCode || ''}
                      onChange={(e) => handleInputChange('tripayMerchantCode', e.target.value)}
                      placeholder="T0001"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tripayApiKey">API Key</Label>
                    <Input
                      id="tripayApiKey"
                      type="password"
                      value={settings.tripayApiKey || ''}
                      onChange={(e) => handleInputChange('tripayApiKey', e.target.value)}
                      placeholder="dev-xxxxx"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tripayPrivateKey">Private Key</Label>
                    <Input
                      id="tripayPrivateKey"
                      type="password"
                      value={settings.tripayPrivateKey || ''}
                      onChange={(e) => handleInputChange('tripayPrivateKey', e.target.value)}
                      placeholder="xxxxx-xxxxx-xxxxx"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">Informasi Tripay</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Dapatkan API Key dari dashboard Tripay</li>
                      <li>• Gunakan mode Sandbox untuk testing</li>
                      <li>• Callback URL: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tripay/callback</li>
                      <li>• Pastikan Private Key disimpan dengan aman</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}