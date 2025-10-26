import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function createAdminSession(admin: any) {
  // Update last login
  await db.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() }
  });

  const payload: JWTPayload = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    name: admin.name
  };

  return generateToken(payload);
}

export async function getAdminByEmail(email: string) {
  return db.admin.findUnique({
    where: { email }
  });
}

export async function getAdminById(id: string) {
  return db.admin.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });
}