import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { PENDING_IMAGE_DEFAULT } from '~/application/constants/default-value';
import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { ConflictException } from '~/application/exceptions/conflict.exception';
import type { FileUpload } from '~/application/types/media.type';
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
import { ImageStatus } from '~/domain/enums/image.enum';
import { ProductStatus } from '~/domain/enums/product.enum';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

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
      create: mock(),
      update: mock(),
      existsByName: mock().mockResolvedValue(false),
    };

    mockImageRepository = {
      createMany: mock(),
      updateMany: mock(),
      deleteMany: mock(),
    };

    mockMediaService = {
      uploadMultiple: mock(),
    };

    mockSlugifyService = {
      slugify: mock((name: string) => name.toLowerCase().replace(/ /g, '-')),
    };

    mockLogger = {
      error: mock(),
      log: mock(),
    };

    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockImageRepository,
      mockMediaService,
      mockSlugifyService,
      mockLogger,
    );
  });

  const mockInput = {
    name: 'Test Product',
    categoryId: 'cat-1',
    description: 'Desc',
    price: 100,
    stock: 10,
    specs: {},
    frGraphData: [],
    status: ProductStatus.PUBLISHED,
    images: [{ alt: 'Img 1', isPrimary: true }],
  };

  const mockFiles: FileUpload[] = [
    { buffer: Buffer.from('test'), originalname: 'test.jpg' },
  ];

  it('should throw ConflictException if product name already exists', async () => {
    mockProductRepository.existsByName.mockResolvedValue(true);

    expect(useCase.execute(mockInput as any, mockFiles)).rejects.toThrow(ConflictException);
    expect(mockProductRepository.existsByName).toHaveBeenCalledWith(mockInput.name);
  });

  it('should throw BadRequestException if images metadata and files length mismatch', async () => {
    const invalidFiles: FileUpload[] = []; // Zero files for 1 metadata entry

    expect(useCase.execute(mockInput as any, invalidFiles)).rejects.toThrow(BadRequestException);
  });

  it('should create product successfully', async () => {
    const pendingImages = [{ id: 'img-1' }];
    const createdProduct = { id: 'prod-1', ...mockInput };
    const uploadResult = [
      {
        status: 'fulfilled',
        value: { url: 'http://res.com', remoteKey: 'k1' },
      },
    ];

    mockImageRepository.createMany.mockResolvedValue(pendingImages);
    mockProductRepository.create.mockResolvedValue(createdProduct);
    mockMediaService.uploadMultiple.mockResolvedValue(uploadResult);

    const result = await useCase.execute(mockInput as any, mockFiles);

    expect(mockImageRepository.createMany).toHaveBeenCalled();
    expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'test-product',
      images: [{ id: 'img-1', isPrimary: true }],
    }));
    expect(mockMediaService.uploadMultiple).toHaveBeenCalledWith(mockFiles);
    expect(mockImageRepository.updateMany).toHaveBeenCalledWith([
      { id: 'img-1', url: 'http://res.com', remoteKey: 'k1', status: ImageStatus.UPLOADED },
    ]);
    expect(result).toEqual(createdProduct as any);
  });

  it('should handle partial upload failures', async () => {
    const pendingImages = [{ id: 'img-1' }, { id: 'img-2' }];
    const inputWithTwoImages = {
      ...mockInput,
      images: [{ alt: 'A1' }, { alt: 'A2' }],
    };
    const twoFiles = [mockFiles[0], mockFiles[0]];
    const uploadResults = [
      { status: 'fulfilled', value: { url: 'u1', remoteKey: 'k1' } },
      { status: 'rejected', reason: new Error('Upload failed') },
    ];

    mockImageRepository.createMany.mockResolvedValue(pendingImages);
    mockMediaService.uploadMultiple.mockResolvedValue(uploadResults);

    await useCase.execute(inputWithTwoImages as any, twoFiles);

    expect(mockImageRepository.deleteMany).toHaveBeenCalledWith(['img-2']);
    expect(mockImageRepository.updateMany).toHaveBeenCalledWith([
      { id: 'img-1', url: 'u1', remoteKey: 'k1', status: ImageStatus.UPLOADED },
    ]);
  });

  it('should fallback to draft if critical error occurs in saga', async () => {
    const pendingImages = [{ id: 'img-1' }];
    mockImageRepository.createMany.mockResolvedValue(pendingImages);
    mockProductRepository.create.mockResolvedValue({ id: 'prod-1' });
    mockMediaService.uploadMultiple.mockRejectedValue(new Error('Network error'));

    await useCase.execute(mockInput as any, mockFiles);

    expect(mockImageRepository.deleteMany).toHaveBeenCalledWith(['img-1']);
    expect(mockProductRepository.update).toHaveBeenCalledWith('prod-1', {
      status: ProductStatus.DRAFT,
    });
  });
});
