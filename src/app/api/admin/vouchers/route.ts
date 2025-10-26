import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) throw new Error('Unauthorized')
  
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request)
    
    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ vouchers })
  } catch (error) {
    console.error('Get vouchers error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request)
    
    const { name, price, duration, description, popular, active } = await request.json()

    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: 'Name, price, dan duration diperlukan' },
        { status: 400 }
      )
    }

    const voucher = await db.voucher.create({
      data: {
        name,
        price: parseInt(price),
        duration,
        description,
        popular: popular || false,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json({ voucher })
  } catch (error) {
    console.error('Create voucher error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}