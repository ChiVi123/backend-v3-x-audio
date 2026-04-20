import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILES } from '~/application/constants/default-value';
import type {
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { UpdateProductUseCase } from '~/application/use-cases/update-product.use-case';
import type { ProductId } from '~/domain/types/branded.type';
import type { CreateProductDto } from '~/presentation/dtos/create-product.dto';
import type { UpdateProductDto } from '~/presentation/dtos/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getListProductUseCase: GetListProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Get()
  async findAll(): Promise<ProductWithCategoryAndSingleImage[]> {
    return this.getListProductUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: ProductId): Promise<ProductWithCategoryAndMultipleImages | null> {
    return this.getProductByIdUseCase.execute(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', MAX_IMAGE_FILES))
  async create(
    @Body() input: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_MIME_TYPES }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<ProductWithCategoryAndMultipleImages> {
    return this.createProductUseCase.execute(input, files);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', MAX_IMAGE_FILES))
  async update(
    @Param('id') id: ProductId,
    @Body() input: UpdateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_MIME_TYPES }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<ProductWithCategoryAndMultipleImages> {
    return this.updateProductUseCase.execute(id, input, files);
  }
}
