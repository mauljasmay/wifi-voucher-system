import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const vouchers = await db.voucher.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ vouchers })
  } catch (error) {
    console.error('Get vouchers error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data voucher' },
      { status: 500 }
    )
  }
}