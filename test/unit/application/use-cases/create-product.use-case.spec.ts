import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { PENDING_IMAGE_DEFAULT } from '~/application/constants/default-value';
import { ConflictException } from '~/application/exceptions/conflict.exception';
import type { FileUpload, ImageResponse } from '~/application/types/media.type';
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
import { ImageStatus } from '~/domain/enums/image.enum';
import { ProductStatus } from '~/domain/enums/product.enum';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies for testing
  let mockProductRepository: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies for testing
  let mockImageRepository: any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking dependencies for testing
  let mockMediaService: any;

  beforeEach(() => {
    // Initialize mock objects
    mockProductRepository = {
      create: mock(),
      update: mock(),
      delete: mock(),
      findById: mock(),
      findAll: mock(),
      existsByName: mock(),
    };

    mockImageRepository = {
      create: mock(),
      createMany: mock(),
      update: mock(),
      updateMany: mock(),
      delete: mock(),
      deleteMany: mock(),
      findByRemoteKey: mock(),
    };

    mockMediaService = {
      upload: mock(),
      delete: mock(),
    };

    useCase = new CreateProductUseCase(mockProductRepository, mockImageRepository, mockMediaService);
  });

  const mockInput = {
    name: 'Test Product',
    slug: 'test-product',
    categoryId: 'uuid-1',
    description: 'Test description',
    price: 1000,
    stock: 10,
    specs: {},
    frGraphData: [],
    status: ProductStatus.PUBLISHED, // Assume client requested LIVE status
  };

  const mockFile: FileUpload = {
    buffer: Buffer.from('test image'),
    originalname: 'test.jpg',
  };

  it('should throw ConflictException if product name already exists', async () => {
    mockProductRepository.existsByName.mockResolvedValue(true);

    // biome-ignore lint/suspicious/noExplicitAny: Mocking input
    expect(useCase.execute(mockInput as any, mockFile)).rejects.toThrow(ConflictException);
    expect(mockProductRepository.existsByName).toHaveBeenCalledWith(mockInput.name);
    expect(mockProductRepository.create).not.toHaveBeenCalled();
  });

  it('should create product as Draft and perform upload', async () => {
    // Prepare mock return results
    const draftProduct = { id: 'prod-1', ...mockInput };
    const pendingImage = { id: 'img-1', ...PENDING_IMAGE_DEFAULT, status: ImageStatus.PENDING };
    const uploadedImage: ImageResponse = {
      remoteKey: 'cloud-key',
      url: 'https://cloudinary.com/test.jpg',
      alt: 'test.jpg',
      provider: 'cloudinary',
      metadata: { width: 100, height: 100, format: 'jpg', bytes: 1000 },
    };

    mockProductRepository.existsByName.mockResolvedValue(false);
    mockProductRepository.create.mockResolvedValue(draftProduct);
    mockImageRepository.create.mockResolvedValue(pendingImage);
    mockMediaService.upload.mockResolvedValue(uploadedImage);
    mockProductRepository.update.mockResolvedValue({});
    mockImageRepository.update.mockResolvedValue({});

    // Execute Use Case
    // biome-ignore lint/suspicious/noExplicitAny: Mocking input
    await useCase.execute(mockInput as any, mockFile);

    // Step 1: Check for existing product name
    expect(mockProductRepository.existsByName).toHaveBeenCalledWith(mockInput.name);

    // Step 2: Create DRAFT product and PENDING image
    expect(mockProductRepository.create).toHaveBeenCalledWith({
      ...mockInput,
      status: ProductStatus.DRAFT,
      // biome-ignore lint/suspicious/noExplicitAny: Mocking input
    } as any);
    expect(mockImageRepository.create).toHaveBeenCalledWith({
      ...PENDING_IMAGE_DEFAULT,
      status: ImageStatus.PENDING,
    });

    // Step 3: Upload to Cloudinary
    expect(mockMediaService.upload).toHaveBeenCalledWith(mockFile);

    // Step 4: Update status of Product and Image after successful upload
    expect(mockProductRepository.update).toHaveBeenCalledWith('prod-1', {
      status: ProductStatus.PUBLISHED,
      keepImages: [{ id: pendingImage.id, isPrimary: true }],
    });

    // Save Cloudinary results to DB
    expect(mockImageRepository.update).toHaveBeenCalledWith('img-1', {
      ...uploadedImage,
      status: ImageStatus.UPLOADED,
    });
  });

  it('should swallow upload error and return draft product (Saga pattern)', async () => {
    const draftProduct = { id: 'prod-1', ...mockInput };
    const pendingImage = { id: 'img-1', ...PENDING_IMAGE_DEFAULT };

    mockProductRepository.existsByName.mockResolvedValue(false);
    mockProductRepository.create.mockResolvedValue(draftProduct);
    mockImageRepository.create.mockResolvedValue(pendingImage);

    // Force upload to fail
    mockMediaService.upload.mockRejectedValue(new Error('Cloudinary timeout'));

    // Execute Use Case
    // biome-ignore lint/suspicious/noExplicitAny: Mocking input
    const result = await useCase.execute(mockInput as any, mockFile);

    // Draft creations should still succeed
    expect(mockProductRepository.create).toHaveBeenCalled();
    expect(mockImageRepository.create).toHaveBeenCalled();

    // Use Case should not throw, but instead return the draft product
    // biome-ignore lint/suspicious/noExplicitAny: Mocking input
    expect(result).toEqual(draftProduct as any);

    // Update DB should never be called due to failed upload
    expect(mockProductRepository.update).not.toHaveBeenCalled();
    expect(mockImageRepository.update).not.toHaveBeenCalled();
  });
});
