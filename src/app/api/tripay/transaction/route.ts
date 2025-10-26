import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createTripayService } from '@/lib/tripay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voucherId, customerName, customerEmail, customerPhone, paymentMethod } = body;

    // Validate input
    if (!voucherId || !customerPhone || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get voucher details
    const voucher = await db.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher || !voucher.active) {
      return NextResponse.json(
        { error: 'Voucher not available' },
        { status: 400 }
      );
    }

    // Get payment settings
    const paymentSettings = await db.paymentSettings.findFirst();
    
    if (!paymentSettings?.tripayEnabled) {
      return NextResponse.json(
        { error: 'Tripay payment is not enabled' },
        { status: 400 }
      );
    }

    const tripayService = createTripayService(paymentSettings);
    
    if (!tripayService) {
      return NextResponse.json(
        { error: 'Tripay configuration is incomplete' },
        { status: 400 }
      );
    }

    // Create transaction in database first
    const merchantRef = `MLJ-${Date.now()}`;
    const transaction = await db.transaction.create({
      data: {
        voucherId,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone,
        paymentMethod: `TRIPAY_${paymentMethod}`,
        amount: voucher.price,
        status: 'pending',
        tripayReference: merchantRef,
      },
    });

    // Prepare transaction data for Tripay
    const transactionData = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      amount: voucher.price,
      customer_name: customerName || customerPhone,
      customer_email: customerEmail || `${customerPhone}@mljnet.com`,
      customer_phone: customerPhone,
      order_items: [
        {
          sku: voucher.id,
          name: voucher.name,
          price: voucher.price,
          quantity: 1,
        },
      ],
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tripay/callback`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    // Create transaction with Tripay
    const tripayResponse = await tripayService.createTransaction(transactionData);

    if (!tripayResponse.success) {
      // Update transaction status to failed
      await db.transaction.update({
        where: { id: transaction.id },
        data: { status: 'failed' },
      });

      return NextResponse.json(
        { error: tripayResponse.message || 'Failed to create payment transaction' },
        { status: 400 }
      );
    }

    // Update transaction with Tripay data
    const updatedTransaction = await db.transaction.update({
      where: { id: transaction.id },
      data: {
        tripayReference: tripayResponse.data.reference,
        tripayPaymentUrl: tripayResponse.data.checkout_url,
        tripayPaymentChannel: tripayResponse.data.payment_method,
        tripayPaymentMethod: tripayResponse.data.payment_name,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        transaction: updatedTransaction,
        paymentUrl: tripayResponse.data.checkout_url,
        payCode: tripayResponse.data.pay_code,
        expiredAt: tripayResponse.data.expired_at,
      },
    });
  } catch (error) {
    console.error('Error creating Tripay transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create payment transaction' },
      { status: 500 }
    );
  }
}