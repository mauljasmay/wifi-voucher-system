import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { MikroTikManager } from '@/lib/mikrotik';

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

    try {
      await mikrotik.connect();
      const profiles = await mikrotik.getProfiles();
      await mikrotik.disconnect();

      return NextResponse.json({
        profiles,
        count: profiles.length
      });

    } catch (mikrotikError) {
      console.error('MikroTik get profiles error:', mikrotikError);
      
      // Update MikroTik settings with error
      await db.mikroTikSettings.update({
        where: { id: mikrotikSettings.id },
        data: {
          connectionStatus: 'failed',
          errorMessage: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { error: 'Gagal mengambil profiles dari MikroTik', details: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Get MikroTik profiles error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}