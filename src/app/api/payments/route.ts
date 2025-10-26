import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let settings = await db.paymentSettings.findFirst()
    
    if (!settings) {
      settings = await db.paymentSettings.create({
        data: {}
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get payment settings error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data pengaturan pembayaran' },
      { status: 500 }
    )
  }
}