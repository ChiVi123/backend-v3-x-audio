import { is, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PgTable } from 'drizzle-orm/pg-core';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import * as schema from '~/infrastructure/database/drizzle/schema';

/**
 * Truncates all tables in the database dynamically using the Drizzle schema.
 * Useful for resetting the database state between E2E tests.
 */
export async function truncateDatabase(db: NodePgDatabase<DrizzleSchema>): Promise<void> {
  const tables = Object.values(schema).filter((element) => is(element, PgTable));
  if (tables.length > 0) {
    await db.execute(sql`TRUNCATE TABLE ${sql.join(tables, sql`, `)} RESTART IDENTITY CASCADE;`);
  }
}

/**
 * Common seeds can be placed here if needed.
 * Alternatively, specific test files can call specific seed functions from seed/data/
 */
export async function seedDatabase(db: NodePgDatabase<DrizzleSchema>): Promise<void> {
  // If specific seed routines are needed for tests, add them here.
  // E.g. await seedCategories(db);
}
