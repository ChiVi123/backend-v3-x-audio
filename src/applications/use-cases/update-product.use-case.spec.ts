/** biome-ignore-all lint/suspicious/noExplicitAny: For test */
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.use-case';

describe('UpdateProductUseCase', () => {
  const mockMediaService = {
    upload: mock(() =>
      Promise.resolve({
        url: 'http://cloudinary.com/new.jpg',
        publicId: 'new_pid',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 1024,
      }),
    ),
    delete: mock(() => Promise.resolve()),
  };

  const mockProductRepo = {
    findById: mock(() =>
      Promise.resolve({
        id: 'p1',
        name: 'Old Product',
        images: [{ id: 'img_old', publicId: 'old_pid', url: 'http://old.com' }],
      }),
    ),
    update: mock((id, input) => {
      const images = [...(input.keepImages || []), ...(input.newImages || [])].map((img) => ({
        ...img,
        url: img.url || 'http://default.com',
      }));

      return Promise.resolve({
        id,
        ...input,
        images,
      });
    }),
  };

  const mockConfigService = {
    get: mock((key: string) => (key === 'NODE_ENV' ? 'test' : null)),
  };

  let useCase: UpdateProductUseCase;

  beforeEach(() => {
    mockMediaService.upload.mockClear();
    mockMediaService.delete.mockClear();
    mockProductRepo.update.mockClear();
    mockProductRepo.findById.mockClear();

    useCase = new UpdateProductUseCase(mockProductRepo as any, mockMediaService as any, mockConfigService as any);
  });

  it('should upload new images, update DB twice, and delete old images from Cloudinary', async () => {
    const updateDto = {
      name: 'Updated Name',
      images: [{ file: Buffer.from('new-file'), isPrimary: true }],
    };

    const result = await useCase.execute('p1' as any, updateDto as any);

    expect(mockProductRepo.findById).toHaveBeenCalledWith('p1');

    expect(mockProductRepo.update).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        name: 'Updated Name',
        newImages: expect.arrayContaining([expect.objectContaining({ url: 'pending' })]),
      }),
    );

    expect(mockMediaService.upload).toHaveBeenCalled();

    expect(result.images[0].url).toBe('http://cloudinary.com/new.jpg');
    expect(result.images[0].publicId).toBe('new_pid');

    expect(mockMediaService.delete).toHaveBeenCalledWith('old_pid');
  });

  it('should rollback (delete from Cloudinary) if the second DB update fails', async () => {
    // Mock: First update successful, upload successful, but the last update fails
    mockProductRepo.update
      .mockResolvedValueOnce({ id: 'p1' } as any) // First update: Pending OK
      .mockRejectedValueOnce(new Error('Final DB Commit Failed')); // Second update: Failed

    const updateDto = {
      images: [{ file: Buffer.from('new-file'), isPrimary: true }],
    };

    try {
      await useCase.execute('p1' as any, updateDto as any);
    } catch (error: any) {
      expect(error.message).toBe('Final DB Commit Failed');

      // Importante: must call delete on Cloudinary for the image just uploaded successfully
      expect(mockMediaService.delete).toHaveBeenCalledWith('new_pid');

      // Not allowed to delete old image 'old_pid' because the main transaction is not completed
      expect(mockMediaService.delete).not.toHaveBeenCalledWith('old_pid');
    }
  });

  it('should throw NotFoundException if product does not exist', async () => {
    mockProductRepo.findById.mockResolvedValueOnce(null as any);

    expect(useCase.execute('non-exist' as any, {} as any)).rejects.toThrow(NotFoundException);

    expect(mockProductRepo.update).not.toHaveBeenCalled();
    expect(mockMediaService.upload).not.toHaveBeenCalled();
  });
});
