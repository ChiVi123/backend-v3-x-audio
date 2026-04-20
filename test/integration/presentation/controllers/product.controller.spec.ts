import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
import { UpdateProductUseCase } from '~/application/use-cases/update-product.use-case';
import { ProductStatus } from '~/domain/enums/product.enum';
import { ProductController } from '~/presentation/controllers/product.controller';

describe('ProductController (Integration)', () => {
  let app: INestApplication<App>;

  // biome-ignore lint/suspicious/noExplicitAny: Mocking external dependencies
  let mockProductRepo: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking external dependencies
  let mockImageRepo: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking external dependencies
  let mockMediaService: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking external dependencies
  let mockSlugifyService: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking external dependencies
  let mockLogger: any;

  beforeAll(async () => {
    // 1. Initialize Mocks with expected behaviors
    mockProductRepo = {
      existsByName: mock().mockResolvedValue(false),
      existsById: mock().mockResolvedValue(true),
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      create: mock().mockResolvedValue({ id: 'mock-draft-product' } as any),
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      update: mock().mockResolvedValue({ id: 'mock-draft-product', status: ProductStatus.PUBLISHED } as any),
      findAll: mock().mockResolvedValue([]),
      findById: mock().mockResolvedValue({ id: 'mock-draft-product' } as any),
    };

    mockImageRepo = {
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      createMany: mock().mockResolvedValue([{ id: 'mock-pending-image' }] as any),
      updateMany: mock().mockResolvedValue([]),
      deleteMany: mock().mockResolvedValue(undefined),
      findByIds: mock().mockResolvedValue([]),
    };

    mockMediaService = {
      uploadMultiple: mock().mockResolvedValue([
        {
          status: 'fulfilled',
          value: {
            remoteKey: 'test-key',
            url: 'https://cloudinary.com/test.jpg',
            provider: 'cloudinary',
          },
        },
      ]),
      deleteMultiple: mock().mockResolvedValue(undefined),
    };

    mockSlugifyService = {
      slugify: mock((text: string) => text.toLowerCase().replace(/ /g, '-')),
    };

    mockLogger = {
      error: mock(),
      log: mock(),
    };

    // 2. Initialize NestJS Testing Module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GetListProductUseCase,
          useFactory: () => new GetListProductUseCase(mockProductRepo),
        },
        {
          provide: GetProductByIdUseCase,
          useFactory: () => new GetProductByIdUseCase(mockProductRepo),
        },
        {
          provide: CreateProductUseCase,
          useFactory: () =>
            new CreateProductUseCase(
              mockProductRepo,
              mockImageRepo,
              mockMediaService,
              mockSlugifyService,
              mockLogger,
            ),
        },
        {
          provide: UpdateProductUseCase,
          useFactory: () =>
            new UpdateProductUseCase(
              mockProductRepo,
              mockImageRepo,
              mockMediaService,
              mockSlugifyService,
              mockLogger,
            ),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /products', () => {
    it('should upload files and return created product successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .field('name', 'Integration Product Airpods')
        .field('categoryId', '550e8400-e29b-41d4-a716-446655440000') // Valid UUID
        .field('description', 'Test desc')
        .field('price', 500)
        .field('stock', 10)
        .field('status', ProductStatus.PUBLISHED)
        .field('specs[impedance]', 32)
        .field('specs[sensitivity]', 105)
        .field('specs[driverType]', 'DYNAMIC')
        .field('specs[frequencyResponse][min]', 20)
        .field('specs[frequencyResponse][max]', 20000)
        .field('frGraphData[0][0]', 20)
        .field('frGraphData[0][1]', 0)
        .field('images[0][alt]', 'Test image')
        .attach(
          'files',
          Buffer.from(
            '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789ccb600000000200017375010e0000000049454e44ae426082',
            'hex',
          ),
          {
            filename: 'test.png',
            contentType: 'image/png',
          },
        );

      if (response.status !== 201) {
        console.log('Error creating product:', response.body);
      }
      expect(response.status).toBe(201);
      expect(mockMediaService.uploadMultiple).toHaveBeenCalled();
      expect(response.body.id).toBe('mock-draft-product');
    });

    it('should reject file greater than 5MB', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024 * 6, 'a');

      const response = await request(app.getHttpServer())
        .post('/products')
        .field('name', 'Too Large Image')
        .attach('files', largeBuffer, {
          filename: 'big.png',
          contentType: 'image/png',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update product successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/products/550e8400-e29b-41d4-a716-446655440000')
        .field('name', 'Updated Product')
        .field('keepImages[0][id]', '550e8400-e29b-41d4-a716-446655440001')
        .field('keepImages[0][isPrimary]', 'true');

      if (response.status !== 200) {
        console.log('Error updating product:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);
      expect(mockProductRepo.update).toHaveBeenCalled();
    });
  });
});
