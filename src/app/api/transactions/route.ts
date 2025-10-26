import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { voucherId, customerName, customerEmail, customerPhone, paymentMethod, amount } = await request.json()

    if (!voucherId || !customerPhone || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Generate unique transaction code
    const transactionCode = `MLJ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const transaction = await db.transaction.create({
      data: {
        voucherId,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        amount: parseInt(amount),
        voucherCode: transactionCode
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

    return NextResponse.json({ 
      success: true,
      transaction,
      message: 'Transaksi berhasil dibuat. Silakan lakukan pembayaran.'
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
      { status: 500 }
    )
  }
}