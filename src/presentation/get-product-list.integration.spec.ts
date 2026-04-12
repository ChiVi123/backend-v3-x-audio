/** biome-ignore-all lint/suspicious/noExplicitAny: For integration test data setup */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import request from 'supertest';
import { AppModule } from '~/app.module';
import { toCategoryId, toImageId, toProductId } from '~/core/types/branded.type';
import { DriverType } from '~/core/types/product.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import { categoryTable, imageTable, productImageTable, productTable } from '~/infrastructure/database/schemas';
import { truncateAllTables } from '~/infrastructure/database/test/drizzle.utils';

describe('ProductController - GetProductList (Data Edge Cases)', () => {
  let app: INestApplication;
  let db: NodePgDatabase;

  const MOCK_CAT_ID = toCategoryId('00000000-0000-0000-0000-000000000001');
  const MOCK_PROD_ID = toProductId('00000000-0000-0000-0000-000000000002');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    db = app.get(DRIZZLE_TOKEN);
  });

  beforeEach(async () => {
    await truncateAllTables(db);

    await db.insert(categoryTable).values({
      id: MOCK_CAT_ID,
      name: 'Headphones',
      slug: 'headphones',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return image null if product has multiple images but none is primary', async () => {
    const [prod] = await db
      .insert(productTable)
      .values({
        id: MOCK_PROD_ID,
        name: 'No Primary Product',
        slug: 'no-primary',
        categoryId: MOCK_CAT_ID,
        description: 'Test description',
        price: 100 as any,
        specs: { driverType: DriverType.Dynamic } as any,
        frGraphData: [],
        status: 'live' as any,
      })
      .returning();

    const imgIds = ['img1', 'img2', 'img3'];
    for (const id of imgIds) {
      const imgId = toImageId(randomUUID());
      await db.insert(imageTable).values({ id: imgId, url: `http://${id}.jpg`, publicId: id });
      await db.insert(productImageTable).values({
        productId: prod.id,
        imageId: imgId,
        isPrimary: false,
      });
    }

    const response = await request(app.getHttpServer()).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toBeArray();

    const targetProduct = response.body.find((p: any) => p.id === prod.id);
    expect(targetProduct.image).toBeNull();
  });

  it('should return full image information if product has a primary image', async () => {
    const [prod] = await db
      .insert(productTable)
      .values({
        id: MOCK_PROD_ID,
        name: 'Standard Product',
        slug: 'standard-prod',
        description: 'Test description',
        categoryId: MOCK_CAT_ID,
        price: 150 as any,
        specs: { driverType: DriverType.Dynamic } as any,
        frGraphData: [],
        status: 'live' as any,
      })
      .returning();

    const imgId = toImageId(randomUUID());
    await db.insert(imageTable).values({
      id: imgId,
      url: 'http://v3x-audio.com/image.jpg',
      publicId: 'v3x_123',
    });

    await db.insert(productImageTable).values({
      productId: prod.id,
      imageId: imgId,
      isPrimary: true,
    });

    const response = await request(app.getHttpServer()).get('/products');

    const target = response.body.find((p: any) => p.id === prod.id);
    expect(target.image).not.toBeNull();
    expect(target.image.url).toBe('http://v3x-audio.com/image.jpg');
  });

  it('should return ALL images when fetching product by ID', async () => {
    const prodId = toProductId(randomUUID());
    await db.insert(productTable).values({
      id: prodId,
      name: 'Detail Test',
      slug: 'detail-test',
      categoryId: MOCK_CAT_ID,
      description: 'Test description',
      price: 100 as any,
      specs: { driverType: DriverType.Dynamic } as any,
      frGraphData: [],
      status: 'live' as any,
    });

    const img1 = toImageId(randomUUID());
    const img2 = toImageId(randomUUID());

    await db.insert(imageTable).values([
      { id: img1, url: 'primary.jpg', publicId: 'p1' },
      { id: img2, url: 'gallery.jpg', publicId: 'g2' },
    ]);

    await db.insert(productImageTable).values([
      { productId: prodId, imageId: img1, isPrimary: true },
      { productId: prodId, imageId: img2, isPrimary: false },
    ]);

    const response = await request(app.getHttpServer()).get(`/products/${prodId}`);

    expect(response.body.images).toHaveLength(2);
    expect(response.body.images.some((img: any) => img.url === 'gallery.jpg')).toBe(true);
  });
});
