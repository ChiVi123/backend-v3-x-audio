/** biome-ignore-all lint/suspicious/noExplicitAny: For test */

import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DriverType } from '~/core/types/product.type';
import { validate } from '~/infrastructure/validations/env.validation';
import { CreateProductUseCase } from './create-product.use-case';

const env = validate(process.env);

describe('CreateProductUseCase', () => {
  const mockMediaService = {
    upload: mock(() =>
      Promise.resolve({
        url: env.IMAGE_PRODUCT_PLACEHOLDER_URL,
        publicId: 'test_id',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 1024,
      }),
    ),
  };

  const mockProductRepo = {
    existsByName: mock(() => Promise.resolve(false)),
    save: mock((input) => Promise.resolve({ ...input, createdAt: new Date(), updatedAt: new Date() })),
    update: mock((id, input) => Promise.resolve({ id, ...input })),
  };

  const mockCategoryRepo = {
    existsById: mock(() => Promise.resolve(true)),
  };

  let useCase: CreateProductUseCase;

  beforeEach(() => {
    mockProductRepo.existsByName.mockClear();
    mockCategoryRepo.existsById.mockClear();

    useCase = new CreateProductUseCase(mockMediaService as any, mockProductRepo as any, mockCategoryRepo as any);
  });

  const dummyDto = {
    name: 'Sony WH-1000XM5',
    categoryId: 'cat_123',
    description: 'Best noise canceling headphones',
    price: 350,
    stock: 50,
    specs: {
      impedance: 32,
      sensitivity: 102,
      frequencyResponse: { min: 4, max: 40000 },
      driverType: DriverType.Dynamic,
    },
    frGraphData: [
      [20, 0],
      [1000, 0],
    ],
    images: [{ file: Buffer.from('test'), isPrimary: true }],
  };

  it('should create product successfully when data is valid', async () => {
    const result = await useCase.execute(dummyDto as any);

    expect(result).toBeDefined();
    expect(mockProductRepo.save).toHaveBeenCalled();
    expect(mockMediaService.upload).toHaveBeenCalled();
    expect(mockProductRepo.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockCategoryRepo.existsById.mockReturnValueOnce(Promise.resolve(false));

    expect(useCase.execute(dummyDto as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if product name already exists', async () => {
    mockProductRepo.existsByName.mockReturnValueOnce(Promise.resolve(true));

    expect(useCase.execute(dummyDto as any)).rejects.toThrow(BadRequestException);
  });
});
