import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { MikroTikManager } from '@/lib/mikrotik';
import { z } from 'zod';

const settingsSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  host: z.string().min(1, 'Host harus diisi'),
  port: z.number().min(1).max(65535),
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
  version: z.enum(['v6', 'v7']),
  useSSL: z.boolean().default(false),
  timeout: z.number().min(1000).max(60000).default(10000),
  isActive: z.boolean().default(true),
  hotspotInterface: z.string().optional(),
  hotspotName: z.string().optional(),
  defaultProfile: z.string().optional()
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

    const settings = await db.mikroTikSettings.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      settings
    });

  } catch (error) {
    console.error('Get MikroTik settings error:', error);
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
    const validation = settingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.issues },
        { status: 400 }
      );
    }

    const settings = validation.data;

    // Test connection
    const mikrotik = new MikroTikManager({
      host: settings.host,
      port: settings.port,
      username: settings.username,
      password: settings.password,
      version: settings.version as 'v6' | 'v7',
      useSSL: settings.useSSL,
      timeout: settings.timeout
    });

    const connectionTest = await mikrotik.testConnection();

    // Create settings
    const newSettings = await db.mikroTikSettings.create({
      data: {
        ...settings,
        connectionStatus: connectionTest ? 'connected' : 'failed',
        lastConnected: connectionTest ? new Date() : null,
        errorMessage: connectionTest ? null : 'Koneksi gagal'
      }
    });

    return NextResponse.json({
      message: 'Pengaturan MikroTik berhasil disimpan',
      settings: newSettings,
      connectionTest
    });

  } catch (error) {
    console.error('Create MikroTik settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}