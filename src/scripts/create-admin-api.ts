import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function createAdmin() {
  try {
    // Try to create admin with string role instead of enum
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await db.$executeRaw`
      INSERT INTO Admin (id, email, password, name, role, isActive, createdAt, updatedAt)
      VALUES (
        'admin_' || hex(randomblob(16)),
        'superadmin@mljnet.com',
        ${hashedPassword},
        'Super Administrator',
        'SUPER_ADMIN',
        true,
        datetime('now'),
        datetime('now')
      )
    `;
    
    console.log('Super Admin created successfully');
    
    const admin2 = await db.$executeRaw`
      INSERT INTO Admin (id, email, password, name, role, isActive, createdAt, updatedAt)
      VALUES (
        'admin_' || hex(randomblob(16)),
        'admin@mljnet.com',
        ${hashedPassword},
        'Administrator',
        'ADMIN',
        true,
        datetime('now'),
        datetime('now')
      )
    `;
    
    console.log('Admin created successfully');
    
    console.log('\n=== Login Credentials ===');
    console.log('Super Admin:');
    console.log('  Email: superadmin@mljnet.com');
    console.log('  Password: admin123');
    console.log('\nAdmin:');
    console.log('  Email: admin@mljnet.com');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

createAdmin();