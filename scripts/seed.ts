import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { categoryTable } from '~/infrastructure/database/schemas/category.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('--- Seeding Categories ---');

  const categories = [
    {
      name: 'In-ear Monitors',
      slug: 'iems',
      description: 'Tai nghe nhét tai cao cấp cho Audiophile.',
    },
    {
      name: 'Over-ear Headphones',
      slug: 'headphones',
      description: 'Tai nghe chụp tai chuyên dụng.',
    },
    {
      name: 'Digital-to-Analog Converters',
      slug: 'dacs',
      description: 'Bộ giải mã âm thanh kỹ thuật số.',
    },
    {
      name: 'Amplifiers',
      slug: 'amps',
      description: 'Bộ khuếch đại tín hiệu âm thanh.',
    },
  ];

  try {
    for (const cat of categories) {
      await db
        .insert(categoryTable)
        .values({
          ...cat,
          // Drizzle will auto generate UUID if not provided,
          // but if you need to keep the ID fixed for testing, pass toCategoryId(...)
        })
        .onConflictDoNothing();
    }
    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    console.log('✅ Close connection!');
    await pool.end();
  }
}

main();
