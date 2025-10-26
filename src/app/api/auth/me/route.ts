import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAdminById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Get admin data
    const admin = await getAdminById(payload.id);
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'Admin tidak ditemukan atau tidak aktif' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      admin
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}