import { boolean, integer, jsonb, pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { ProductSpecs } from '~/domain/entities/product.entity';
import type { ProductId } from '~/domain/types/branded.type';
import { timestamps } from '~/infrastructure/database/drizzle/schema/base.schema';
import { categoryTable } from '~/infrastructure/database/drizzle/schema/category.schema';

export const productStatusEnum = pgEnum('product_status', ['draft', 'live', 'archived']);

export const productTable = pgTable('product', {
  id: uuid('id').primaryKey().notNull().defaultRandom().$type<ProductId>(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  categoryId: uuid('category_id')
    .references(() => categoryTable.id)
    .notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').default(0).notNull(),
  specs: jsonb('specs').$type<ProductSpecs>().notNull(),
  frGraphData: jsonb('fr_graph_data').$type<[number, number][]>().notNull(),
  threeModelId: varchar('three_model_id', { length: 255 }),
  status: productStatusEnum('status').default('draft').notNull(),
  aiGenerated: boolean('ai_generated').default(false).notNull(),
  ...timestamps,
});
