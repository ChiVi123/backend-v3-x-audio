import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

console.log('[DRIZZLE CLIENT]', process.env.DATABASE_URL);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export const closeConnection = async () => {
  await pool.end();
};

export { db };
