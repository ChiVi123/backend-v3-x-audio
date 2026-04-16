import { sql } from 'drizzle-orm';
import { boolean, pgTable, primaryKey, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { imageTable } from '~/infrastructure/database/drizzle/schema/image.schema';
import { productTable } from '~/infrastructure/database/drizzle/schema/product.schema';

export const productImageTable = pgTable(
  'product_image',
  {
    productId: uuid('product_id')
      .references(() => productTable.id, { onDelete: 'cascade' })
      .notNull(),
    imageId: uuid('image_id')
      .references(() => imageTable.id, { onDelete: 'cascade' })
      .notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.imageId] }),
    uniquePrimaryIdx: uniqueIndex('unique_primary_image_per_product').on(t.productId).where(sql`is_primary=true`),
  }),
);
