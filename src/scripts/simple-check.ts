import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function check() {
  try {
    const admins = await db.admin.findMany();
    console.log('Admin count:', admins.length);
    admins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.role})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

check();