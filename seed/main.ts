import { Logger } from '@nestjs/common';
import { is, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { PgTable } from 'drizzle-orm/pg-core';
import * as schema from '~/infrastructure/database/drizzle/schema';
import { seedCategories } from './data/categories.seed';
import { seedImages } from './data/images.seed';
import { seedProductImages } from './data/product-images.seed';
import { seedProducts } from './data/products.seed';

const logger = new Logger('Seed');

async function main() {
  logger.log(`Connecting to: ${process.env.DATABASE_URL}`, 'Seed');

  const db = drizzle(process.env.DATABASE_URL!);

  // ── 0. Truncate Tables ────────────────────────────────────────────────────
  logger.log('Truncating tables...');
  const tables = Object.values(schema).filter((element) => is(element, PgTable));
  if (tables.length > 0) {
    await db.execute(sql`TRUNCATE TABLE ${sql.join(tables, sql`, `)} RESTART IDENTITY CASCADE;`);
  }

  // ── 1. Categories ─────────────────────────────────────────────────────────
  logger.log('Seeding categories...');
  await seedCategories(db);

  // ── 2. Images ─────────────────────────────────────────────────────────────
  logger.log('Seeding images...');
  await seedImages(db);

  // ── 3. Products ───────────────────────────────────────────────────────────
  logger.log('Seeding products...');
  await seedProducts(db);

  // ── 4. Product Images (junction table) ────────────────────────────────────
  logger.log('Seeding product images...');
  await seedProductImages(db);

  logger.log('Done! Database seeded successfully. ✅');
}

main().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
