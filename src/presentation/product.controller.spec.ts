/** biome-ignore-all lint/suspicious/noExplicitAny: For Test */
import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CreateProductUseCase } from '~/applications/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '~/applications/use-cases/update-product.use-case';
import { CategoryRepository } from '~/core/repositories/category.repository';
import { ProductRepository } from '~/core/repositories/product.repository';
import { MediaService } from '~/core/services/media.service';
import { ProductController } from '~/presentation/product.controller';

describe('ProductController (Integration - Form Data)', () => {
  let app: INestApplication;

  // Mock dependencies to focus on testing the Form Data flow
  const mockMediaService = {
    upload: mock(() =>
      Promise.resolve({
        url: 'https://cloudinary.com/v3x.jpg',
        publicId: 'v3x_audio_123',
        width: 1000,
        height: 1000,
        format: 'jpg',
        bytes: 50000,
      }),
    ),
  };

  const mockProductRepo = {
    existsByName: mock(() => Promise.resolve(false)),
    save: mock((input) => Promise.resolve({ id: 'prod_1', ...input })),
    update: mock((id, input) => Promise.resolve({ id, ...input })),
  };

  const mockCategoryRepo = {
    findById: mock(() => Promise.resolve({ id: 'cat_1', name: 'Audio' })),
    existsById: mock(() => Promise.resolve(true)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        CreateProductUseCase,
        UpdateProductUseCase,
        { provide: MediaService, useValue: mockMediaService },
        { provide: ProductRepository, useValue: mockProductRepo },
        { provide: CategoryRepository, useValue: mockCategoryRepo },
        { provide: ConfigService, useValue: { get: () => 'test' } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Must have ValidationPipe to check DTO
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should parse complex form-data and create product successfully', async () => {
    const fakeBuffer = Buffer.from('fake-image-binary');

    const response = await request(app.getHttpServer())
      .post('/products')
      // Send physical file
      .attach('files', fakeBuffer, 'test-headphone.jpg')
      // Send normal fields (Postman-style)
      .field('name', 'V3-X Precision One')
      .field('price', '1200') // String number
      .field('categoryId', 'cat_123')
      .field('description', 'High-end audiophile headphone')
      .field(
        'frGraphData',
        JSON.stringify([
          [20, 10],
          [1000, 5],
          [20000, -2],
        ]),
      )
      // Send JSON string for nested object
      .field(
        'specs',
        JSON.stringify({
          impedance: 32,
          sensitivity: 105,
          driverType: 'Dynamic',
          frequencyResponse: { min: 20, max: 20000 },
        }),
      )
      // Send JSON string for image metadata array
      .field('images', JSON.stringify([{ isPrimary: true, altText: 'Front side' }]));

    expect(response.status).toBe(201);

    // Check if UseCase received correctly parsed data
    const lastSaveCall = mockProductRepo.save.mock.calls[0][0];

    // Check if Branded Types/Numbers have been parsed from string
    expect(typeof lastSaveCall.price).toBe('number');
    expect(lastSaveCall.price).toBe(1200);

    // Check if Specs has become an Object
    expect(lastSaveCall.specs.impedance).toBe(32);
    expect(lastSaveCall.specs.driverType).toBe('Dynamic');

    // Check if file has been mixed into DTO
    expect(mockMediaService.upload).toHaveBeenCalled();
    const uploadArg = (mockMediaService.upload.mock.calls as any[][])[0][0];
    expect(uploadArg).toBeInstanceOf(Buffer);
  });
});
