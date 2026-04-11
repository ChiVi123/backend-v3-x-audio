/** biome-ignore-all lint/suspicious/noExplicitAny: For test */

import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.use-case';

describe('UpdateProductUseCase', () => {
  const mockMediaService = {
    upload: mock(() => Promise.resolve({ url: 'http://new.com', publicId: 'new_pid' })),
    delete: mock(() => Promise.resolve()),
  };

  const mockProductRepo = {
    findById: mock(() =>
      Promise.resolve({
        id: 'p1',
        images: [{ id: 'img_old', publicId: 'old_pid' }],
      }),
    ),
    update: mock((id, input) => Promise.resolve({ id, ...input })),
  };

  let useCase: UpdateProductUseCase;

  beforeEach(() => {
    mockMediaService.upload.mockClear();
    mockMediaService.delete.mockClear();
    mockProductRepo.update.mockClear();

    useCase = new UpdateProductUseCase(mockProductRepo as any, mockMediaService as any);
  });

  it('should delete old image when update successfully', async () => {
    const updateDto = {
      name: 'New Name',
      images: [
        { file: Buffer.from('new-file'), isPrimary: true },
        // Don't pass 'img_old' id -> img_old will be deleted
      ],
    };

    await useCase.execute('p1' as any, updateDto as any);

    expect(mockMediaService.upload).toHaveBeenCalled();
    expect(mockProductRepo.update).toHaveBeenCalled();
    // Check if old image 'old_pid' was deleted
    expect(mockMediaService.delete).toHaveBeenCalledWith('old_pid');
  });

  it('should rollback new image if DB update fails', async () => {
    mockProductRepo.update.mockImplementationOnce(() => Promise.reject(new Error('DB Fail')));

    const updateDto = {
      images: [{ file: Buffer.from('new-file'), isPrimary: true }],
    };

    try {
      await useCase.execute('p1' as any, updateDto as any);
    } catch (_e) {
      // Must delete the uploaded image (new_pid) to avoid clutter
      expect(mockMediaService.delete).toHaveBeenCalledWith('new_pid');
      // Should not delete the old image (old_pid) because the DB update was not successful
      expect(mockMediaService.delete).not.toHaveBeenCalledWith('old_pid');
    }
  });

  it('should throw an error if product not found', async () => {
    mockProductRepo.findById.mockReturnValueOnce(Promise.resolve(null) as any);
    expect(useCase.execute('p1' as any, {})).rejects.toThrow(NotFoundException);
  });
});
