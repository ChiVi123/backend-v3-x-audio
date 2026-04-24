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
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILES } from '~/application/constants/default-value';
import type {
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';
import type { PaginatedResult } from '~/application/types/pagination.type';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { CreateProductUseCase, CreateProductUseCaseInput } from '~/application/use-cases/create-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { UpdateProductUseCase, UpdateProductUseCaseInput } from '~/application/use-cases/update-product.use-case';
import type { ProductId } from '~/domain/types/branded.type';
// biome-ignore lint/style/useImportType: NestJS ValidationPipe uses reflect-metadata to resolve this class as a runtime token for validation and transformation; `import type` would erase it at compile time
import { CreateProductDto } from '~/presentation/dtos/create-product.dto';
// biome-ignore lint/style/useImportType: NestJS ValidationPipe uses reflect-metadata to resolve this class as a runtime token for validation and transformation; `import type` would erase it at compile time
import { PaginationQueryDto } from '~/presentation/dtos/pagination-query.dto';
// biome-ignore lint/style/useImportType: NestJS ValidationPipe uses reflect-metadata to resolve this class as a runtime token for validation and transformation; `import type` would erase it at compile time
import { UpdateProductDto } from '~/presentation/dtos/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getListProductUseCase: GetListProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResult<ProductWithCategoryAndSingleImage>> {
    return this.getListProductUseCase.execute(query.page, query.limit);
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
    return this.createProductUseCase.execute(input as unknown as CreateProductUseCaseInput, files);
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
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ): Promise<ProductWithCategoryAndMultipleImages | null> {
    return this.updateProductUseCase.execute(id, input as unknown as UpdateProductUseCaseInput, files);
  }
}
