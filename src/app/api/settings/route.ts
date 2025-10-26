import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let settings = await db.websiteSettings.findFirst()
    
    if (!settings) {
      settings = await db.websiteSettings.create({
        data: {}
      })
    }

    let paymentSettings = await db.paymentSettings.findFirst()
    
    if (!paymentSettings) {
      paymentSettings = await db.paymentSettings.create({
        data: {}
      })
    }

    return NextResponse.json({ 
      settings,
      paymentSettings 
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data pengaturan' },
      { status: 500 }
    )
  }
}