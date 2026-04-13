import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { roleTable } from '~/infrastructure/database/schemas';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const ROLES = [
  {
    name: 'admin',
    description: 'Administrator with full access to the system.',
  },
  {
    name: 'customer',
    description: 'Default role for registered customers.',
  },
  {
    name: 'editor',
    description: 'Staff responsible for managing product content.',
  },
];

async function seed() {
  console.log('🌱 Seeding roles...');

  try {
    for (const role of ROLES) {
      const existing = await db.select().from(roleTable).where(eq(roleTable.name, role.name)).limit(1);

      if (existing.length === 0) {
        await db.insert(roleTable).values({
          name: role.name,
          description: role.description,
        });
        console.log(`✅ Role "${role.name}" created.`);
      } else {
        console.log(`ℹ️ Role "${role.name}" already exists, skipping.`);
      }
    }

    console.log('🚀 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
