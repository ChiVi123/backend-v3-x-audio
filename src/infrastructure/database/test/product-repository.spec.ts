/** biome-ignore-all lint/suspicious/noExplicitAny: For test */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { categoryTable } from '~/infrastructure/database/schemas/category.schema';
import { imageTable, productImageTable } from '~/infrastructure/database/schemas/image.schema';
import { productTable } from '~/infrastructure/database/schemas/product.schema';
import { closeConnection, db } from '~/infrastructure/database/test/drizzle.client';
import { truncateAllTables } from '~/infrastructure/database/test/drizzle.utils';

describe('ProductRepository Integration (Transaction)', () => {
  beforeAll(async () => {
    await truncateAllTables(db);
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('should cascade delete product_image when product is deleted', async () => {
    const categoryId = crypto.randomUUID() as any;
    const productId = crypto.randomUUID() as any;
    const imageId = crypto.randomUUID() as any;

    await db.insert(categoryTable).values({
      id: categoryId,
      name: 'Test Category',
      slug: 'test-category',
    });

    const [product] = await db
      .insert(productTable)
      .values({
        id: productId,
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        categoryId: categoryId,
        description: '...',
        price: 1000 as any,
        specs: {
          impedance: 32 as any,
          sensitivity: 100 as any,
          frequencyResponse: { min: 20 as any, max: 20000 as any },
          driverType: 'dynamic',
        } as any,
        frGraphData: [],
      })
      .returning();

    const [img] = await db
      .insert(imageTable)
      .values({
        id: imageId,
        publicId: `pid-${Date.now()}`,
        url: 'http://test.com',
      })
      .returning();

    await db.insert(productImageTable).values({
      productId: product.id,
      imageId: img.id,
    });

    await db.delete(productTable).where(eq(productTable.id, product.id));

    const joinRecord = await db.select().from(productImageTable).where(eq(productImageTable.productId, product.id));
    const imageRecord = await db.select().from(imageTable).where(eq(imageTable.id, img.id));

    expect(joinRecord.length).toBe(0); // Was cascade deleted
    expect(imageRecord.length).toBe(1); // Original image still exists (for GC to clean up later)
  });
});
