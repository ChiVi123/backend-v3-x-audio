import { type AnyPgColumn, integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { CategoryId } from '~/domain/types/branded.type';
import { timestamps } from '~/infrastructure/database/drizzle/schema/base.schema';

export const categoryTable = pgTable('category', {
  id: uuid('id').primaryKey().notNull().defaultRandom().$type<CategoryId>(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  productCount: integer('product_count').default(0).notNull(),
  description: text('description'),
  // Self-reference: Need to use AnyPgColumn to avoid circular reference type error
  parentId: uuid('parent_id').references((): AnyPgColumn => categoryTable.id, { onDelete: 'set null' }),
  ...timestamps,
});
