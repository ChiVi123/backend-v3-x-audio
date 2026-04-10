import { integer, jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import type { ProductSpecs } from '~/core/entities/product.entity';
import type { ProductId, Usd } from '~/core/types/branded.type';
import { timestamps } from '~/infrastructure/database/schemas/base.schema';
import { categoryTable } from '~/infrastructure/database/schemas/category.schema';

export const productTable = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom().$type<ProductId>(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  categoryId: uuid('category_id')
    .references(() => categoryTable.id)
    .notNull(),
  price: integer('price').$type<Usd>().notNull(),
  stock: integer('stock').default(0).notNull(),
  specs: jsonb('specs').$type<ProductSpecs>().notNull(),
  frGraphData: jsonb('fr_graph_data').$type<[number, number][]>().notNull(),
  threeModelId: varchar('three_model_id', { length: 255 }),
  ...timestamps,
});
