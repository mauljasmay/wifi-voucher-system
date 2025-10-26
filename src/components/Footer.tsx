import Link from 'next/link'
import { Wifi, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Wifi className="w-8 h-8 text-blue-400 mr-2" />
              <span className="text-2xl font-bold">MLJ-NET</span>
            </div>
            <p className="text-gray-300 dark:text-gray-400 mb-4 max-w-md">
              Solusi WiFi hotspot terpercaya di Indonesia. Menyediakan akses internet cepat dan stabil untuk kebutuhan personal dan bisnis Anda.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Layanan</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/voucher" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  WiFi Voucher
                </Link>
              </li>
              <li>
                <Link href="#membership" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="#business" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Business Solution
                </Link>
              </li>
              <li>
                <Link href="#admin" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Admin Area
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <span className="text-gray-300 dark:text-gray-400">+62 812-3456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                <span className="text-gray-300 dark:text-gray-400">info@mlj-net.id</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-blue-400 mt-1" />
                <span className="text-gray-300 dark:text-gray-400">
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">
            © 2024 MLJ-NET. All rights reserved. | 
            <a href="#" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
            <a href="#" className="hover:text-white transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}