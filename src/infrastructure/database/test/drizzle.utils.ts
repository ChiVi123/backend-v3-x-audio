import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function truncateAllTables(db: NodePgDatabase) {
  const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name != '__drizzle_migrations';
  `);

  const tables = result.rows.map((r) => `"${r.table_name}"`).join(', ');

  if (tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`));
  }
}
