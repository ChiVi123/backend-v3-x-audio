import { relations } from 'drizzle-orm';
import { categoryTable, imageTable, productImageTable, productTable } from '~/infrastructure/database/drizzle/schema';

export const categoryRelations = relations(categoryTable, ({ one, many }) => ({
  products: many(productTable),
  parent: one(categoryTable, {
    fields: [categoryTable.parentId],
    references: [categoryTable.id],
    relationName: 'category_parent_child',
  }),
  children: many(categoryTable, {
    relationName: 'category_parent_child',
  }),
}));

export const imageRelations = relations(imageTable, ({ many }) => ({
  productImages: many(productImageTable),
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
  productImages: many(productImageTable),
}));

export const productImageRelations = relations(productImageTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productImageTable.productId],
    references: [productTable.id],
  }),
  image: one(imageTable, {
    fields: [productImageTable.imageId],
    references: [imageTable.id],
  }),
}));
