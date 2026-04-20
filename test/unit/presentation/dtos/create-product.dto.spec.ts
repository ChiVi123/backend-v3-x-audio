import 'reflect-metadata';
import { describe, expect, it } from 'bun:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DriverType, ProductStatus } from '~/domain/enums/product.enum';
import { CreateProductDto } from '~/presentation/dtos/create-product.dto';

describe('CreateProductDto', () => {
  const validData = {
    name: 'Test Product',
    categoryId: 'uuid-1',
    description: 'Test description',
    price: 1500,
    stock: 20,
    specs: {
      impedance: 32,
      sensitivity: 105,
      frequencyResponse: { min: 20, max: 20000 },
      driverType: DriverType.DYNAMIC,
    },
    frGraphData: [
      [20, 0],
      [1000, 5],
    ],
    status: ProductStatus.DRAFT,
    images: [{ alt: 'Img 1', isPrimary: true }],
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateProductDto, validData);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('basic fields validation', () => {
    it('should fail when name is empty', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, name: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail when categoryId is empty', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, categoryId: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
    });

    it('should fail when description is empty', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, description: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });
  });

  describe('price and stock validation', () => {
    it('should fail when price is negative', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, price: -1 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'price')).toBe(true);
    });

    it('should fail when price is not undefined', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, price: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'price')).toBe(true);
    });

    it('should fail when stock is not an integer', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, stock: 10.5 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'stock')).toBe(true);
    });

    it('should fail when stock is negative', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, stock: -10 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'stock')).toBe(true);
    });
  });

  describe('specs validation', () => {
    it('should fail when specs is missing', async () => {
      const { specs, ...rest } = validData;
      const dto = plainToInstance(CreateProductDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'specs')).toBe(true);
    });

    it('should fail when specs contains invalid frequencyResponse', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validData,
        specs: { ...validData.specs, frequencyResponse: { min: -1, max: 20000 } },
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'specs')).toBe(true);
      // Nested error check
      const specError = errors.find((e) => e.property === 'specs');
      // Children[0] is FrequencyResponseDto within ProductSpecsDto
      expect(specError?.children?.[0]?.children?.[0]?.property).toBe('min');
    });

    it('should fail when driverType is invalid', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validData,
        specs: { ...validData.specs, driverType: 'Invalid' },
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'specs')).toBe(true);
    });
  });

  describe('frGraphData validation', () => {
    it('should fail when frGraphData is not an array', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, frGraphData: 'not an array' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'frGraphData')).toBe(true);
    });

    it('should fail when elements are not tuples of length 2', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, frGraphData: [[1, 2, 3]] });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'frGraphData')).toBe(true);
    });

    it('should fail when tuple elements are not numbers', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, frGraphData: [[1, 'a']] });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'frGraphData')).toBe(true);
    });
  });

  describe('status validation', () => {
    it('should fail when status is invalid', async () => {
      const dto = plainToInstance(CreateProductDto, { ...validData, status: 'unknown' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should pass when optional fields are provided', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validData,
        threeModelId: 'model-123',
        aiGenerated: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when optional fields are provided with wrong types', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validData,
        threeModelId: 123,
        aiGenerated: 'yes',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'threeModelId')).toBe(true);
      expect(errors.some((e) => e.property === 'aiGenerated')).toBe(true);
    });
  });

  describe('images validation', () => {
    it('should fail when images is missing', async () => {
      const { images, ...rest } = validData;
      const dto = plainToInstance(CreateProductDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'images')).toBe(true);
    });

    it('should fail when images contains invalid data', async () => {
      const dto = plainToInstance(CreateProductDto, {
        ...validData,
        images: [{ alt: '' }], // Empty alt
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'images')).toBe(true);
    });
  });
});
