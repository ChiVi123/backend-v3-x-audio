import { type AnyPgColumn, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { CategoryId } from '~/core/types/branded.type';
import { timestamps } from '~/infrastructure/database/schemas/base.schema';

export const categoryTable = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom().$type<CategoryId>(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  // Self-reference: Need to use AnyPgColumn to avoid circular reference type error
  parentId: uuid('parent_id').references((): AnyPgColumn => categoryTable.id, { onDelete: 'set null' }),
  description: text('description'),
  ...timestamps,
});
