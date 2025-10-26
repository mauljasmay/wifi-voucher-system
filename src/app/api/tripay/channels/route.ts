import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createTripayService } from '@/lib/tripay';

export async function GET() {
  try {
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

    const channels = await tripayService.getPaymentChannels();
    
    return NextResponse.json({
      success: true,
      data: channels,
    });
  } catch (error) {
    console.error('Error fetching Tripay channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment channels' },
      { status: 500 }
    );
  }
}