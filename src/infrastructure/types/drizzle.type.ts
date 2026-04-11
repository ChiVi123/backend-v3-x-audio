import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';

/**
 * Type alias for Drizzle transactional context
 */
export type DrizzleTX = PgTransaction<NodePgQueryResultHKT, DrizzleDB, ExtractTablesWithRelations<DrizzleDB>>;
