import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import * as schema from '~/infrastructure/database/schemas';

export const DrizzleProvider = {
  provide: DRIZZLE_TOKEN,
  useFactory: () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    return drizzle(pool, { schema });
  },
};

export type DrizzleDB = typeof schema;
