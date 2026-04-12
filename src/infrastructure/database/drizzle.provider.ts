import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import * as schema from '~/infrastructure/database/schemas';
import type { EnvironmentVariables } from '~/infrastructure/validations/env.validation';

export const DrizzleProvider = {
  provide: DRIZZLE_TOKEN,
  useFactory: (configService: ConfigService<EnvironmentVariables>) => {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true });
    console.log('[DrizzleProvider] useFactory', databaseUrl);
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    return drizzle(pool, { schema });
  },
  inject: [ConfigService],
};

export type DrizzleDB = typeof schema;
