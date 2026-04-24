import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { UserRoleId } from '~/domain/types/branded.type';
import { timestamps } from '~/infrastructure/database/drizzle/schema/base.schema';

export const roleTable = pgTable('role', {
  id: uuid('id').primaryKey().notNull().defaultRandom().$type<UserRoleId>(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  ...timestamps,
});
