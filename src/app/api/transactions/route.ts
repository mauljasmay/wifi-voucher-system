import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MikroTikManager } from '@/lib/mikrotik'

export async function POST(request: NextRequest) {
  try {
    const { voucherId, customerName, customerEmail, customerPhone, paymentMethod, amount } = await request.json()

    if (!voucherId || !customerPhone || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Get voucher details
    const voucher = await db.voucher.findUnique({
      where: { id: voucherId }
    })

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher tidak ditemukan' },
        { status: 404 }
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
            duration: true,
            mikrotikProfile: true,
            timeLimit: true,
            dataLimit: true,
            autoCreate: true,
            syncWithMikrotik: true
          }
        }
      }
    })

    // Auto-create voucher in MikroTik if enabled
    let mikrotikVoucher = null
    if (voucher.autoCreate && voucher.syncWithMikrotik) {
      try {
        // Get active MikroTik settings
        const mikrotikSettings = await db.mikroTikSettings.findFirst({
          where: { isActive: true }
        })

        if (mikrotikSettings) {
          const mikrotik = new MikroTikManager({
            host: mikrotikSettings.host,
            port: mikrotikSettings.port,
            username: mikrotikSettings.username,
            password: mikrotikSettings.password,
            version: mikrotikSettings.version as 'v6' | 'v7',
            useSSL: mikrotikSettings.useSSL,
            timeout: mikrotikSettings.timeout
          })

          // Generate username and password
          const username = await mikrotik.generateVoucherCode(8)
          const password = await mikrotik.generatePassword(8)

          await mikrotik.connect()

          // Create voucher in MikroTik
          const voucherData = {
            username,
            password,
            profile: voucher.mikrotikProfile || mikrotikSettings.defaultProfile || 'default',
            timeLimit: voucher.timeLimit ?? undefined,
            dataLimit: voucher.dataLimit ?? undefined,
            comment: `Voucher: ${voucher.name} - Customer: ${customerName || 'Anonymous'} - Transaction: ${transaction.id}`
          }

          const mikrotikUser = await mikrotik.createVoucher(voucherData)

          // Update transaction with MikroTik details
          await db.transaction.update({
            where: { id: transaction.id },
            data: {
              mikrotikUsername: username,
              mikrotikPassword: password,
              mikrotikProfile: voucherData.profile,
              mikrotikCreated: true,
              mikrotikSynced: true,
              voucherCode: `${username}/${password}`
            }
          })

          mikrotikVoucher = {
            username,
            password,
            profile: voucherData.profile,
            voucherCode: `${username}/${password}`
          } as any

          await mikrotik.disconnect()
        }
      } catch (mikrotikError) {
        console.error('MikroTik auto-creation error:', mikrotikError)
        // Don't fail the transaction if MikroTik creation fails
      }
    }

    return NextResponse.json({ 
      success: true,
      transaction,
      mikrotikVoucher,
      message: mikrotikVoucher 
        ? 'Transaksi berhasil dibuat dan voucher telah dibuat di MikroTik.'
        : 'Transaksi berhasil dibuat. Silakan lakukan pembayaran.'
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
      { status: 500 }
    )
  }
}