import { NextRequest, NextResponse } from 'next/server'

// Tripay API configuration
const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY || 'DEV-3Vh6F2rY5kWm9vQxL8zJ7sB2nA4cX1yZ'
const TRIPAY_PIN = process.env.TRIPAY_PIN || '324567'
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE || 'T33501'
const TRIPAY_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tripay.co.id/api' 
  : 'https://tripay.co.id/api-sandbox'

export async function POST(request: NextRequest) {
  try {
    const { amount, phone, packageName } = await request.json()

    if (!amount || !phone) {
      return NextResponse.json(
        { error: 'Amount and phone are required' },
        { status: 400 }
      )
    }

    // Create unique order ID
    const orderId = `MLJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Prepare payload for Tripay (without signature first)
    const payloadData = {
      method: 'QRIS', // Fixed to QRIS only
      merchant_code: TRIPAY_MERCHANT_CODE,
      amount: amount,
      merchant_ref: orderId,
      customer_name: `Customer-${phone.slice(-4)}`, // Use last 4 digits of phone
      customer_email: '', // Empty as requested
      customer_phone: phone,
      order_items: [
        {
          sku: 'WIFI-VOUCHER',
          name: packageName || 'WiFi Voucher',
          price: amount,
          quantity: 1
        }
      ],
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tripay/callback`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/vouchers/payment-status`,
      expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
    }

    // Add signature to payload
    const payload = {
      ...payloadData,
      signature: generateSignature(payloadData)
    }

    // Make request to Tripay API
    const response = await fetch(`${TRIPAY_API_URL}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok || data.success === false) {
      console.error('Tripay API Error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Return payment details
    return NextResponse.json({
      success: true,
      data: {
        reference: data.data.reference,
        qr_url: data.data.qr_url,
        qr_string: data.data.qr_string,
        amount: data.data.amount,
        status: data.data.status,
        expired_at: data.data.expired_at,
        pay_url: data.data.pay_url,
        order_id: orderId
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSignature(payload: any) {
  // Generate signature for Tripay API
  // This is a simplified version - you should implement proper signature generation
  const stringToSign = `${TRIPAY_MERCHANT_CODE}${payload.merchant_ref}${payload.amount}`
  
  // For demo purposes, return a simple hash
  // In production, use proper HMAC-SHA256 with your private key
  return Buffer.from(stringToSign).toString('base64')
}

export async function GET(request: NextRequest) {
  // Check payment status
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json(
      { error: 'Reference is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`${TRIPAY_API_URL}/transaction/detail?reference=${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`
      }
    })

    const data = await response.json()

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        { error: data.message || 'Failed to check payment status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data.data
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}