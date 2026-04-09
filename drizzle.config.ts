import { defineConfig } from 'drizzle-kit';

console.log('[Drizzle Config] DATABASE_URL:', process.env.DATABASE_URL);

export default defineConfig({
  schema: ['./src/infrastructure/database/schemas/*.schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
