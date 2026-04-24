import 'reflect-metadata';
import { describe, expect, it } from 'bun:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProductDto } from '~/presentation/dtos/update-product.dto';

describe('UpdateProductDto', () => {
  const validData = {
    name: 'Updated Name',
    keepImages: [
      { id: '550e8400-e29b-41d4-a716-446655440000', isPrimary: true }
    ],
    removeImageIds: ['550e8400-e29b-41d4-a716-446655440000'],
    newImages: [{ alt: 'New', isPrimary: false }]
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(UpdateProductDto, validData);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty data (all fields optional in Update)', async () => {
    const dto = plainToInstance(UpdateProductDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('keepImages validation', () => {
    it('should fail if keepImages is not an array', async () => {
      const dto = plainToInstance(UpdateProductDto, { keepImages: 'not-array' });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'keepImages')).toBe(true);
    });

    it('should fail if keepImages items missing id', async () => {
      const dto = plainToInstance(UpdateProductDto, { keepImages: [{ isPrimary: true }] });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'keepImages')).toBe(true);
    });

    it('should fail if id is not a UUID', async () => {
      const dto = plainToInstance(UpdateProductDto, { keepImages: [{ id: 'not-uuid' }] });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'keepImages')).toBe(true);
    });
  });

  describe('removeImageIds validation', () => {
    it('should fail if removeImageIds contains non-UUIDs', async () => {
      const dto = plainToInstance(UpdateProductDto, { removeImageIds: ['invalid-uuid'] });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'removeImageIds')).toBe(true);
    });
  });

  describe('newImages validation', () => {
    it('should fail if newImages contains invalid fields', async () => {
      const dto = plainToInstance(UpdateProductDto, { newImages: [{ isPrimary: 'maybe' }] });
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'newImages')).toBe(true);
    });
  });
});
