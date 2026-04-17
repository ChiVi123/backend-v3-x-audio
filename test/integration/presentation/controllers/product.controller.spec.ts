import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
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

  beforeAll(async () => {
    // 1. Initialize Mocks with expected behaviors
    mockProductRepo = {
      existsByName: mock().mockResolvedValue(false),
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      create: mock().mockResolvedValue({ id: 'mock-draft-product' } as any),
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      update: mock().mockResolvedValue({ id: 'mock-draft-product', status: ProductStatus.PUBLISHED } as any),
      findAll: mock().mockResolvedValue([]),
    };

    mockImageRepo = {
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      create: mock().mockResolvedValue({ id: 'mock-pending-image' } as any),
      // biome-ignore lint/suspicious/noExplicitAny: Mocking valid return DTO
      update: mock().mockResolvedValue({ id: 'mock-pending-image', url: 'https://cloudinary.test' } as any),
    };

    mockMediaService = {
      upload: mock().mockResolvedValue({
        remoteKey: 'test-key',
        url: 'https://cloudinary.com/test.jpg',
        provider: 'cloudinary',
      }),
    };

    // 2. Initialize NestJS Testing Module without importing other robust infrastructure modules
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        // Register Use Cases
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
          useFactory: () => new CreateProductUseCase(mockProductRepo, mockImageRepo, mockMediaService),
        },
        // We explicitly don't need to provide global tokens here because we injected mocks manually via factory
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Simulate production environment with Validation
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /products', () => {
    it('should upload file and return created product successfully', async () => {
      // 3. Simulate an actual HTTP Request to the Controller
      const response = await request(app.getHttpServer())
        .post('/products')
        .field('name', 'Integration Product Airpods')
        .field('slug', 'integration-product-airpods')
        .field('categoryId', 'cat-123')
        .field('description', 'Test desc')
        .field('price', 500)
        .field('status', ProductStatus.PUBLISHED)
        // Attach a mock file to pass FileInterceptor and ParseFilePipe
        .attach(
          'file',
          Buffer.from(
            '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789ccb600000000200017375010e0000000049454e44ae426082',
            'hex',
          ),
          {
            filename: 'test.png',
            contentType: 'image/png',
          },
        );

      // 4. Expect HTTP 201 Created
      if (response.status !== 201) {
        console.log('Error creating product:', response.body);
      }
      expect(response.status).toBe(201);

      // Expect Use Case to receive the request and call the Media Service
      expect(mockMediaService.upload).toHaveBeenCalled();

      // Expect the API response to match mockProductRepo.update
      expect(response.body.id).toBe('mock-draft-product');
    });

    it('should reject file greater than 5MB automatically by ParseFilePipe', async () => {
      // Simulate creating a very large file buffer (6MB)
      const largeBuffer = Buffer.alloc(1024 * 1024 * 6, 'a');

      const response = await request(app.getHttpServer())
        .post('/products')
        .field('name', 'Too Large Image')
        .attach('file', largeBuffer, {
          filename: 'big.png',
          contentType: 'image/png',
        });

      // NestJS ParseFilePipe should automatically block and return 400 Bad Request
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');

      // Use case is blocked, Media Service should not be called again
      expect(mockMediaService.upload).toHaveBeenCalledTimes(1); // 1 time from the previous test
    });
  });
});
