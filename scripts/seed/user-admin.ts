import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { toUserId } from '~/core/types/branded.type';
import { roleTable, userRoleTable, userTable } from '~/infrastructure/database/schemas';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedAdmin() {
  console.log('🚀 Starting Admin Seeding...');

  try {
    const adminRole = await db.select().from(roleTable).where(eq(roleTable.name, 'admin')).limit(1);

    if (adminRole.length === 0) {
      throw new Error('❌ Role "admin" not found. Please run seed:roles first.');
    }

    const adminEmail = 'admin@v3x-audio.com';
    const rawPassword = '26B9@public.admin';

    const existingAdmin = await db.select().from(userTable).where(eq(userTable.email, adminEmail)).limit(1);

    if (existingAdmin.length > 0) {
      console.log('ℹ️ Admin user already exists. Skipping.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);
    const adminId = toUserId(crypto.randomUUID());

    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({
        id: adminId,
        email: adminEmail,
        passwordHash: passwordHash,
        fullName: 'System Administrator',
        status: 'active',
      });

      await tx.insert(userRoleTable).values({
        userId: adminId,
        roleId: adminRole[0].id,
      });
    });

    console.log('✅ Admin account created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${rawPassword}`);
  } catch (error) {
    console.error('❌ Admin Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
