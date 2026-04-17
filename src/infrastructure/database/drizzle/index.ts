import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '~/config/env.validation';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import * as relations from '~/infrastructure/database/drizzle/relations';
import * as schema from '~/infrastructure/database/drizzle/schema';

export const DrizzleProvider: Provider = {
  provide: DRIZZLE_TOKEN,
  useFactory: (configService: ConfigService<EnvironmentVariables>) => {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true });
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    return drizzle(pool, { casing: 'snake_case', schema: { ...schema, ...relations } });
  },
  inject: [ConfigService],
};

export type DrizzleSchema = typeof schema & typeof relations;
