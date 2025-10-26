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

    const { searchParams } = new URL(request.url);
    const profile = searchParams.get('profile');
    const active = searchParams.get('active');

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

      let users = [];
      
      if (active === 'true') {
        users = await mikrotik.getActiveUsers();
      } else if (profile) {
        users = await mikrotik.getUsersByProfile(profile);
      } else {
        // Get all users (this might need to be implemented in the MikroTikManager)
        users = await mikrotik.getActiveUsers();
      }

      await mikrotik.disconnect();

      return NextResponse.json({
        users,
        count: users.length
      });

    } catch (mikrotikError) {
      console.error('MikroTik get users error:', mikrotikError);
      
      // Update MikroTik settings with error
      await db.mikroTikSettings.update({
        where: { id: mikrotikSettings.id },
        data: {
          connectionStatus: 'failed',
          errorMessage: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { error: 'Gagal mengambil data dari MikroTik', details: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Get MikroTik users error:', error);
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

    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username diperlukan' },
        { status: 400 }
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
      await mikrotik.deleteUser(username);
      await mikrotik.disconnect();

      return NextResponse.json({
        message: `User ${username} berhasil dihapus`
      });

    } catch (mikrotikError) {
      console.error('MikroTik delete user error:', mikrotikError);
      
      return NextResponse.json(
        { error: 'Gagal menghapus user di MikroTik', details: mikrotikError instanceof Error ? mikrotikError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete MikroTik user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}