/** biome-ignore-all lint/suspicious/noExplicitAny: For test */

import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { DriverType } from '~/core/types/product.type';
import { CreateProductUseCase } from './create-product.use-case';

describe('CreateProductUseCase', () => {
  const mockConfigService = {
    get: mock((key: string) => {
      if (key === 'NODE_ENV') return 'test';
      return undefined;
    }),
  };
  const mockMediaService = {
    upload: mock(() =>
      Promise.resolve({
        url: 'https://example.com/image.jpg',
        publicId: 'new-id',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 1024,
      }),
    ),
    delete: mock(() => Promise.resolve()),
  };

  const mockProductRepo = {
    existsByName: mock(() => Promise.resolve(false)),
    save: mock((input) => Promise.resolve({ ...input, id: 'prod_123' })),
    update: mock((id, input) => Promise.resolve({ id, ...input })),
  };

  const mockCategoryRepo = {
    existsById: mock(() => Promise.resolve(true)),
  };

  let useCase: CreateProductUseCase;

  beforeEach(() => {
    mockMediaService.upload.mockClear();
    mockMediaService.delete.mockClear();
    mockProductRepo.save.mockClear();
    mockProductRepo.update.mockClear();
    mockProductRepo.existsByName.mockClear();
    mockCategoryRepo.existsById.mockClear();

    useCase = new CreateProductUseCase(
      mockMediaService as any,
      mockProductRepo as any,
      mockCategoryRepo as any,
      mockConfigService as any,
    );
  });

  const dummyDto = {
    name: 'Tai nghe V3-X',
    categoryId: 'cat_123',
    price: 500,
    images: [{ file: Buffer.from('test'), isPrimary: true }],
    specs: {
      impedance: 32,
      sensitivity: 100,
      frequencyResponse: { min: 20, max: 20000 },
      driverType: DriverType.Dynamic,
    },
    frGraphData: [[20, 0]],
  };

  it('should create product successfully with 3-step process', async () => {
    const result = await useCase.execute(dummyDto as any);

    expect(mockProductRepo.save).toHaveBeenCalled(); // Step 1: Save Draft
    expect(mockMediaService.upload).toHaveBeenCalled(); // Step 2: Upload
    expect(mockProductRepo.update).toHaveBeenCalled(); // Step 3: Update URL
    expect(result).toBeDefined();
  });

  it('should delete image on Cloudinary if the final DB update step fails (Rollback)', async () => {
    // Simulate the final DB update step failing
    mockProductRepo.update.mockImplementationOnce(() => Promise.reject(new Error('DB Error')));

    try {
      await useCase.execute(dummyDto as any);
    } catch (_e) {
      // Check if mediaService.delete was called to clean up
      expect(mockMediaService.delete).toHaveBeenCalledWith('new-id');
    }
  });

  it('should throw an error if the product already exists', async () => {
    mockProductRepo.existsByName.mockReturnValueOnce(Promise.resolve(true));

    expect(useCase.execute(dummyDto as any)).rejects.toThrow(BadRequestException);
    expect(mockMediaService.upload).not.toHaveBeenCalled();
  });
});
