/** biome-ignore-all lint/suspicious/noExplicitAny: For test */
import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { closeConnection } from 'scripts/drizzle-client';
import { DriverType } from '~/core/types/product.type';
import { categoryTable } from '~/infrastructure/database/schemas/category.schema';
import { imageTable, productImageTable } from '~/infrastructure/database/schemas/image.schema';
import { productTable } from '~/infrastructure/database/schemas/product.schema';
import { db } from '~/infrastructure/database/test/drizzle.client';
import { truncateAllTables } from '~/infrastructure/database/test/drizzle.utils';
import { ImageGarbageCollector } from '~/infrastructure/tasks/image-garbage-collector.service';

describe('ImageGarbageCollector Integration', () => {
  // Mock MediaService to not call Cloudinary
  const mockMediaService = {
    delete: mock(() => Promise.resolve()),
  };

  const gcService = new ImageGarbageCollector(db as any, mockMediaService as any);

  beforeAll(async () => {
    await truncateAllTables(db);
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('should only delete orphaned images and keep live ones', async () => {
    // 0. Setup: Create Category and Product to satisfy Foreign Key
    const [cat] = await db
      .insert(categoryTable)
      .values({
        id: crypto.randomUUID() as any,
        name: 'Test Category',
        slug: `test-category-${Date.now()}`,
      })
      .returning();

    const [prod] = await db
      .insert(productTable)
      .values({
        id: crypto.randomUUID() as any,
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        categoryId: cat.id,
        description: 'Test description',
        price: 1000 as any,
        specs: {
          impedance: 32 as any,
          sensitivity: 100 as any,
          frequencyResponse: { min: 20 as any, max: 20000 as any },
          driverType: DriverType.Dynamic,
        },
        frGraphData: [],
        status: 'live',
      })
      .returning();

    // 1. Setup: Create Live Image (being used)
    const liveImgId = crypto.randomUUID() as any;
    await db.insert(imageTable).values({
      id: liveImgId,
      publicId: 'live-pid',
      url: 'http://cdn.com/live.jpg',
    });

    // Attach image to the real Product just created
    await db.insert(productImageTable).values({
      productId: prod.id, // Use real ID from database
      imageId: liveImgId,
      isPrimary: true,
    });

    // 2. Setup: Create Orphaned Image (not attached to any product)
    const orphanImgId = crypto.randomUUID() as any;
    await db.insert(imageTable).values({
      id: orphanImgId,
      publicId: 'orphan-pid',
      url: 'http://cdn.com/orphan.jpg',
    });

    // 3. Execute GC
    await gcService.handleCleanup();

    // 4. Assertions
    const imagesInDb = await db.select().from(imageTable);
    const imageIds = imagesInDb.map((img) => img.id);

    expect(imageIds).toContain(liveImgId); // Live image must remain
    expect(imageIds).not.toContain(orphanImgId); // Orphaned image must be deleted
    expect(mockMediaService.delete).toHaveBeenCalledWith('orphan-pid');
  });
});
