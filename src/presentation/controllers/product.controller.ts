import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {
  CreateProductInput,
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
import type { ProductId } from '~/domain/types/branded.type';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getListProductUseCase: GetListProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
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
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() input: CreateProductInput,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ProductWithCategoryAndMultipleImages> {
    return this.createProductUseCase.execute(input, file);
  }
}
