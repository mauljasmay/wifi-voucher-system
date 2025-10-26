'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Save,
  Loader2,
  Upload
} from 'lucide-react'

interface WebsiteSettings {
  id: string
  siteName: string
  siteTitle: string
  description: string
  keywords?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
}

export default function WebsiteSettings() {
  const [settings, setSettings] = useState<WebsiteSettings>({
    id: '',
    siteName: 'MLJ-NET',
    siteTitle: 'MLJ-NET - WiFi Hotspot Voucher Tercepat',
    description: 'Provider internet hotspot terpercaya dengan voucher WiFi murah dan cepat',
    keywords: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#facc15',
    secondaryColor: '#f97316'
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
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      setError('Gagal memuat pengaturan')
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
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Pengaturan berhasil disimpan')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Gagal menyimpan pengaturan')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof WebsiteSettings, value: string) => {
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
              <h1 className="text-2xl font-bold">Pengaturan Website</h1>
              <p className="text-gray-400 mt-1">Kelola tampilan dan informasi website</p>
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
          {/* Basic Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-yellow-400" />
                <span>Informasi Dasar</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan nama dan judul website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nama Website</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Judul Website (SEO)</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Website</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (SEO)</Label>
                <Input
                  id="keywords"
                  value={settings.keywords || ''}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
              <CardDescription className="text-gray-400">
                Detail kontak yang akan ditampilkan di website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Kontak</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telepon/WhatsApp</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone || ''}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactAddress">Alamat</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contactAddress || ''}
                  onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription className="text-gray-400">
                Logo dan warna tema website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      value={settings.logoUrl || ''}
                      onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                      placeholder="/logo.png"
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-gray-600 hover:bg-gray-700"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">URL Favicon</Label>
                  <div className="flex gap-2">
                    <Input
                      id="faviconUrl"
                      value={settings.faviconUrl || ''}
                      onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                      placeholder="/favicon.png"
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-gray-600 hover:bg-gray-700"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Warna Primer</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10 w-20"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="bg-gray-700 border-gray-600 flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10 w-20"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="bg-gray-700 border-gray-600 flex-1"
                    />
                  </div>
                </div>
              </div>
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