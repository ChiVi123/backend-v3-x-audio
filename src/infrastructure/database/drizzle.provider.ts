// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import * as schema from '~/infrastructure/database/schemas';
import type { EnvironmentVariables } from '~/infrastructure/validations/env.validation';

export const DrizzleProvider = {
  provide: DRIZZLE_TOKEN,
  useFactory: (configService: ConfigService<EnvironmentVariables>) => {
    const pool = new Pool({
      connectionString: configService.get('DATABASE_URL', { infer: true }),
    });
    return drizzle(pool, { schema });
  },
};

export type DrizzleDB = typeof schema;
