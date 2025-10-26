import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const createAdminSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN'])
});

// Middleware to check if user is Super Admin
async function isSuperAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload || payload.role !== 'SUPER_ADMIN') {
    return null;
  }

  return payload;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is Super Admin
    const superAdmin = await isSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    // Get all admins except the requester
    const admins = await db.admin.findMany({
      where: {
        id: { not: superAdmin.id }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is Super Admin
    const superAdmin = await isSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = createAdminSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Check if email already exists
    const existingAdmin = await db.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const newAdmin = await db.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Admin berhasil dibuat',
      admin: newAdmin
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}