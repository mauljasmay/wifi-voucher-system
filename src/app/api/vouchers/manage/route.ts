import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const voucherSchema = z.object({
  name: z.string().min(1, 'Nama voucher harus diisi'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  duration: z.string().min(1, 'Durasi harus diisi'),
  description: z.string().optional(),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  // MikroTik Integration Fields
  mikrotikProfile: z.string().optional(),
  timeLimit: z.string().optional(),
  dataLimit: z.string().optional(),
  autoCreate: z.boolean().default(false),
  syncWithMikrotik: z.boolean().default(false)
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

export async function GET(request: NextRequest) {
  try {
    const admin = await isAuthenticated(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      vouchers
    });

  } catch (error) {
    console.error('Get vouchers error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
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
    const validation = voucherSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.errors },
        { status: 400 }
      );
    }

    const voucherData = validation.data;

    // Create voucher
    const newVoucher = await db.voucher.create({
      data: voucherData
    });

    return NextResponse.json({
      message: 'Voucher berhasil dibuat',
      voucher: newVoucher
    });

  } catch (error) {
    console.error('Create voucher error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await isAuthenticated(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Voucher ID diperlukan' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = voucherSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update voucher
    const updatedVoucher = await db.voucher.update({
      where: { id },
      data: validation.data
    });

    return NextResponse.json({
      message: 'Voucher berhasil diperbarui',
      voucher: updatedVoucher
    });

  } catch (error) {
    console.error('Update voucher error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await isAuthenticated(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Voucher ID diperlukan' },
        { status: 400 }
      );
    }

    // Check if voucher has transactions
    const transactionCount = await db.transaction.count({
      where: { voucherId: id }
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus voucher yang memiliki transaksi' },
        { status: 400 }
      );
    }

    // Delete voucher
    await db.voucher.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Voucher berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete voucher error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}