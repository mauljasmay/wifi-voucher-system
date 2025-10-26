import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { MikroTikManager } from '@/lib/mikrotik';
import { z } from 'zod';

const createVoucherSchema = z.object({
  voucherId: z.string().min(1, 'Voucher ID diperlukan'),
  transactionId: z.string().min(1, 'Transaction ID diperlukan'),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customUsername: z.string().optional(),
  customPassword: z.string().optional()
});

// Middleware to check if user is authenticated
async function isAuthenticated(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function POST(request: NextRequest) {
  try {
    const admin = await isAuthenticated(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = createVoucherSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { voucherId, transactionId, customerName, customerEmail, customUsername, customPassword } = validation.data;

    // Get voucher details
    const voucher = await db.voucher.findUnique({
      where: { id: voucherId }
    });

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get transaction details
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get active MikroTik settings
    const mikrotikSettings = await db.mikroTikSettings.findFirst({
      where: { isActive: true }
    });

    if (!mikrotikSettings) {
      return NextResponse.json(
        { error: 'Pengaturan MikroTik tidak ditemukan' },
        { status: 404 }
      );
    }

    // Initialize MikroTik manager
    const mikrotik = new MikroTikManager({
      host: mikrotikSettings.host,
      port: mikrotikSettings.port,
      username: mikrotikSettings.username,
      password: mikrotikSettings.password,
      version: mikrotikSettings.version as 'v6' | 'v7',
      useSSL: mikrotikSettings.useSSL,
      timeout: mikrotikSettings.timeout
    });

    // Generate username and password
    const username = customUsername || await mikrotik.generateVoucherCode(8);
    const password = customPassword || await mikrotik.generatePassword(8);

    try {
      // Connect to MikroTik
      await mikrotik.connect();

      // Create voucher in MikroTik
      const voucherData = {
        username,
        password,
        profile: voucher.mikrotikProfile || mikrotikSettings.defaultProfile || 'default',
        timeLimit: voucher.timeLimit,
        dataLimit: voucher.dataLimit,
        comment: `Voucher: ${voucher.name} - Customer: ${customerName || 'Anonymous'} - Transaction: ${transactionId}`
      };

      const mikrotikUser = await mikrotik.createVoucher(voucherData);

      // Update transaction with MikroTik details
      await db.transaction.update({
        where: { id: transactionId },
        data: {
          mikrotikUsername: username,
          mikrotikPassword: password,
          mikrotikProfile: voucherData.profile,
          mikrotikCreated: true,
          mikrotikSynced: true,
          voucherCode: `${username}/${password}`
        }
      });

      // Update MikroTik settings connection status
      await db.mikroTikSettings.update({
        where: { id: mikrotikSettings.id },
        data: {
          connectionStatus: 'connected',
          lastConnected: new Date(),
          errorMessage: null
        }
      });

      await mikrotik.disconnect();

      return NextResponse.json({
        message: 'Voucher berhasil dibuat di MikroTik',
        voucher: {
          username,
          password,
          profile: voucherData.profile,
          voucherCode: `${username}/${password}`,
          mikrotikUser
        }
      });

    } catch (mikrotikError) {
      console.error('MikroTik voucher creation error:', mikrotikError);
      
      // Update MikroTik settings with error
      await db.mikroTikSettings.update({
        where: { id: mikrotikSettings.id },
        data: {
          connectionStatus: 'failed',
          errorMessage: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { error: 'Gagal membuat voucher di MikroTik', details: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Create MikroTik voucher error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}