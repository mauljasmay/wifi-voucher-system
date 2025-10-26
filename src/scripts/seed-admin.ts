import { db } from '../lib/db';
import { hashPassword } from '../lib/auth';

async function seedAdmin() {
  try {
    // Check if super admin already exists
    let existingSuperAdmin = await db.admin.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!existingSuperAdmin) {
      // Create Super Admin
      const superAdminPassword = await hashPassword('admin123');
      existingSuperAdmin = await db.admin.create({
        data: {
          email: 'superadmin@mljnet.com',
          password: superAdminPassword,
          name: 'Super Administrator',
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      console.log('Super Admin created:', existingSuperAdmin.email);
    } else {
      console.log('Super Admin already exists:', existingSuperAdmin.email);
    }

    // Check if regular admin already exists
    let existingAdmin = await db.admin.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!existingAdmin) {
      // Create regular Admin
      const adminPassword = await hashPassword('admin123');
      existingAdmin = await db.admin.create({
        data: {
          email: 'admin@mljnet.com',
          password: adminPassword,
          name: 'Administrator',
          role: 'ADMIN',
          isActive: true
        }
      });
      console.log('Admin created:', existingAdmin.email);
    } else {
      console.log('Admin already exists:', existingAdmin.email);
    }

    console.log('\n=== Login Credentials ===');
    console.log('Super Admin:');
    console.log('  Email: superadmin@mljnet.com');
    console.log('  Password: admin123');
    console.log('\nAdmin:');
    console.log('  Email: admin@mljnet.com');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await db.$disconnect();
  }
}

seedAdmin();