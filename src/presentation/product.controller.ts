import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { CreateProductDto } from '~/applications/dtos/create-product.dto';
import type { UpdateProductDto } from '~/applications/dtos/update-product.dto';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { CreateProductUseCase } from '~/applications/use-cases/create-product.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { GetProductByIdUseCase } from '~/applications/use-cases/get-product-by-id.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { GetProductListUseCase } from '~/applications/use-cases/get-product-list.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UpdateProductUseCase } from '~/applications/use-cases/update-product.use-case';
import { toProductId } from '~/core/types/branded.type';
import { JwtAuthGuard } from '~/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '~/infrastructure/auth/guards/roles.guard';
import { Roles } from '~/infrastructure/decorators/auth-roles.decorator';
import { ParseFormData } from '~/infrastructure/decorators/parse-form-data.decorator';

@Controller('products')
export class ProductController {
  constructor(
    private readonly createUseCase: CreateProductUseCase,
    private readonly updateUseCase: UpdateProductUseCase,
    private readonly getProductListUseCase: GetProductListUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.getProductByIdUseCase.execute(toProductId(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.getProductListUseCase.execute({
      categoryId,
      limit: limit ? Number(limit) : 10,
      page: page ? Number(page) : 1,
    });
  }

  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('files')) // Field name 'files' in Postman
  async create(@ParseFormData() dto: CreateProductDto) {
    // At this point, dto.images[0].file is already a Buffer, ready for Use Case to upload to Cloudinary
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('admin', 'editor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async update(@Param('id') id: string, @ParseFormData() dto: UpdateProductDto) {
    return this.updateUseCase.execute(toProductId(id), dto);
  }
}
