import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { NotFoundException } from '~/application/exceptions/not-found.exception';
import type { FileUpload } from '~/application/types/media.type';
import { UpdateProductUseCase } from '~/application/use-cases/update-product.use-case';
import { ImageStatus } from '~/domain/enums/image.enum';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;

  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies
  let mockProductRepository: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies
  let mockImageRepository: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies
  let mockMediaService: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies
  let mockSlugifyService: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies
  let mockLogger: any;

  beforeEach(() => {
    mockProductRepository = {
      update: mock(),
      existsById: mock().mockResolvedValue(true),
    };

    mockImageRepository = {
      findByIds: mock().mockResolvedValue([]),
      createMany: mock().mockResolvedValue([]),
      updateMany: mock(),
      deleteMany: mock(),
    };

    mockMediaService = {
      uploadMultiple: mock().mockResolvedValue([]),
      deleteMultiple: mock(),
    };

    mockSlugifyService = {
      slugify: mock((name: string) => name.toLowerCase().replace(/ /g, '-')),
    };

    mockLogger = {
      error: mock(),
    };

    useCase = new UpdateProductUseCase(
      mockProductRepository,
      mockImageRepository,
      mockMediaService,
      mockSlugifyService,
      mockLogger,
    );
  });

  const mockInput = {
    name: 'Updated Product',
    keepImages: [{ id: 'img-old', isPrimary: true }],
    removeImageIds: ['img-remove'],
    newImages: [{ alt: 'New Img', isPrimary: false }],
  };

  const mockFiles: FileUpload[] = [{ buffer: Buffer.from('new'), originalname: 'new.jpg' }];

  it('should throw NotFoundException if product does not exist', async () => {
    mockProductRepository.existsById.mockResolvedValue(false);

    expect(useCase.execute('prod-1' as any, mockInput as any, mockFiles)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if new images metadata/files mismatch', async () => {
    expect(useCase.execute('prod-1' as any, mockInput as any, [])).rejects.toThrow(BadRequestException);
  });

  it('should update product and new images successfully', async () => {
    const newlyCreatedImages = [{ id: 'img-new' }];
    mockImageRepository.createMany.mockResolvedValue(newlyCreatedImages);
    mockProductRepository.update.mockResolvedValue({ id: 'prod-1' });
    mockMediaService.uploadMultiple.mockResolvedValue([
      { status: 'fulfilled', value: { url: 'u-new', remoteKey: 'k-new' } },
    ]);
    mockImageRepository.findByIds.mockResolvedValue([{ id: 'img-remove', remoteKey: 'k-remove' }]);

    await useCase.execute('prod-1' as any, mockInput as any, mockFiles);

    // Check product update
    expect(mockProductRepository.update).toHaveBeenCalledWith(
      'prod-1',
      expect.objectContaining({
        name: 'Updated Product',
        slug: 'updated-product',
        keepImages: [
          { id: 'img-old', isPrimary: true },
          { id: 'img-new', isPrimary: false },
        ],
      }),
    );

    // Check new image update
    expect(mockImageRepository.updateMany).toHaveBeenCalledWith([
      { id: 'img-new', url: 'u-new', remoteKey: 'k-new', status: ImageStatus.UPLOADED },
    ]);

    // Check cleanup
    expect(mockMediaService.deleteMultiple).toHaveBeenCalledWith(['k-remove']);
    expect(mockImageRepository.deleteMany).toHaveBeenCalledWith(['img-remove']);
  });

  it('should handle failures during new image upload', async () => {
    const newlyCreatedImages = [{ id: 'img-new' }];
    mockImageRepository.createMany.mockResolvedValue(newlyCreatedImages);
    mockMediaService.uploadMultiple.mockResolvedValue([{ status: 'rejected', reason: new Error('Upload fail') }]);

    await useCase.execute('prod-1' as any, mockInput as any, mockFiles);

    expect(mockImageRepository.deleteMany).toHaveBeenCalledWith(['img-new']);
  });

  it('should handle logger call if storage deletion fails', async () => {
    mockImageRepository.findByIds.mockResolvedValue([{ id: 'img-remove', remoteKey: 'k-remove' }]);
    mockMediaService.deleteMultiple.mockRejectedValue(new Error('Storage delete fail'));

    await useCase.execute('prod-1' as any, mockInput as any, mockFiles);

    expect(mockLogger.error).toHaveBeenCalled();
    // Should still delete from DB even if storage delete fails
    expect(mockImageRepository.deleteMany).toHaveBeenCalledWith(['img-remove']);
  });
});
