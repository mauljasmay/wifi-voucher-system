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
    
    const { status, voucherCode } = await request.json()
    const { id } = params

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(voucherCode && { voucherCode })
      },
      include: {
        voucher: {
          select: {
            name: true,
            duration: true
          }
        }
      }
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Unauthorized atau terjadi kesalahan' },
      { status: 401 }
    )
  }
}