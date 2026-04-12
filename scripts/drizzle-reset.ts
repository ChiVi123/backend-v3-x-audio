import { closeConnection, db } from './drizzle-client';
import { truncateAllTables } from './drizzle-integration';

async function main() {
  console.log('[Script Drizzle] --- Resetting Database ---');
  await truncateAllTables(db);
  console.log('[Script Drizzle] ✅ Database reset successfully!');
  await closeConnection();
}

main();
