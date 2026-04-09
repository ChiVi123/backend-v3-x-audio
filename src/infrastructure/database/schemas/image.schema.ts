import { boolean, jsonb, pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { ImageId } from '~/core/types/branded.type';
import { timestamps } from '~/infrastructure/database/schemas/base.schema';
import { productTable } from '~/infrastructure/database/schemas/product.schema';

export const imageTable = pgTable('image', {
  id: uuid('id').primaryKey().defaultRandom().$type<ImageId>(),
  publicId: varchar('public_id', { length: 255 }).notNull(),
  url: text('url').notNull(),
  altText: varchar('alt_text', { length: 255 }),
  metadata: jsonb('metadata').$type<{ width: number; height: number; format: string; bytes: number }>(),
  ...timestamps,
});

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
  }),
);
