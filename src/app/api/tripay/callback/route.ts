import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log callback for debugging
    console.log('Tripay Callback:', body)
    
    // Extract payment data
    const { 
      reference, 
      status, 
      merchant_ref, 
      total_amount, 
      customer_phone,
      signature 
    } = body

    // Verify signature (implement proper signature verification)
    const isValidSignature = verifySignature(body)
    
    if (!isValidSignature) {
      console.error('Invalid signature received')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Process payment based on status
    if (status === 'PAID') {
      // Payment successful - generate and send voucher
      const voucherCode = generateVoucherCode()
      
      // Here you would typically:
      // 1. Save transaction to database
      // 2. Send voucher via WhatsApp
      // 3. Update customer records
      
      console.log(`Payment successful for ${customer_phone}. Voucher: ${voucherCode}`)
      
      // Send voucher via WhatsApp (implement WhatsApp integration)
      await sendVoucherViaWhatsApp(customer_phone, voucherCode, merchant_ref)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully',
        voucher_code: voucherCode 
      })
    } else if (status === 'UNPAID' || status === 'EXPIRED') {
      // Payment failed or expired
      console.log(`Payment ${status.toLowerCase()} for reference: ${reference}`)
      return NextResponse.json({ 
        success: false, 
        message: `Payment ${status.toLowerCase()}` 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Callback received' 
    })

  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function verifySignature(payload: any): boolean {
  // Implement proper signature verification
  // For now, return true for demo purposes
  return true
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function sendVoucherViaWhatsApp(phone: string, voucherCode: string, orderId: string) {
  // Implement WhatsApp API integration
  // For now, just log the message
  const message = `*MLJ-NET Voucher WiFi*\n\nTerima kasih telah melakukan pembelian!\n\n*Kode Voucher:* ${voucherCode}\n*Order ID:* ${orderId}\n\nCara Penggunaan:\n1. Hubungkan ke WiFi "MLJ-NET"\n2. Browser akan otomatis membuka halaman login\n3. Masukkan kode voucher di atas\n4. Klik "Login" dan nikmati internet Anda\n\nSupport: 0812-3456-7890`
  
  console.log(`WhatsApp message to ${phone}:`, message)
  
  // In production, integrate with WhatsApp Business API
  // Example:
  // await fetch('https://api.whatsapp.com/send', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${WHATSAPP_API_KEY}` },
  //   body: JSON.stringify({
  //     phone: phone,
  //     message: message
  //   })
  // })
}