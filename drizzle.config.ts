import { Logger } from '@nestjs/common';
import { defineConfig } from 'drizzle-kit';

Logger.log(process.env.DATABASE_URL, 'Drizzle Config');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/drizzle/schema/*.schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
