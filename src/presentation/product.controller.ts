import { Controller, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { CreateProductDto } from '~/applications/dtos/create-product.dto';
import type { UpdateProductDto } from '~/applications/dtos/update-product.dto';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { CreateProductUseCase } from '~/applications/use-cases/create-product.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UpdateProductUseCase } from '~/applications/use-cases/update-product.use-case';
import { toProductId } from '~/core/types/branded.type';
import { ParseFormData } from '~/infrastructure/decorators/parse-form-data.decorator';

@Controller('products')
export class ProductController {
  constructor(
    private readonly createUseCase: CreateProductUseCase,
    private readonly updateUseCase: UpdateProductUseCase,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files')) // Field name 'files' in Postman
  async create(@ParseFormData() dto: CreateProductDto) {
    // At this point, dto.images[0].file is already a Buffer, ready for Use Case to upload to Cloudinary
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(@Param('id') id: string, @ParseFormData() dto: UpdateProductDto) {
    return this.updateUseCase.execute(toProductId(id), dto);
  }
}
