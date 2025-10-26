import { db } from '../lib/db';

async function checkAdmins() {
  try {
    const admins = await db.admin.findMany();
    console.log('Existing admins:');
    admins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.role}) - Active: ${admin.isActive}`);
    });
  } catch (error) {
    console.error('Error checking admins:', error);
  } finally {
    await db.$disconnect();
  }
}

checkAdmins();