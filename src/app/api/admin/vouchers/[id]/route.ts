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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin(request)
    
    const { name, price, duration, description, popular, active } = await request.json()
    const { id } = params

    const voucher = await db.voucher.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseInt(price) }),
        ...(duration && { duration }),
        ...(description !== undefined && { description }),
        ...(popular !== undefined && { popular }),
        ...(active !== undefined && { active })
      }
    })

    return NextResponse.json({ voucher })
  } catch (error) {
    console.error('Update voucher error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin(request)
    const { id } = params

    await db.voucher.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete voucher error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}