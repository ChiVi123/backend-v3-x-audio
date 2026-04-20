import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '~/domain/enums/product.enum';
import { IsNumberTupleArray } from '~/presentation/decorators/is-number-tuple-array.decorator';
import { JsonTransform } from '~/presentation/decorators/json-transform.decorator';
import { ImageDto } from '~/presentation/dtos/image.dto';
import { ProductSpecsDto } from '~/presentation/dtos/product-specs.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ProductSpecsDto)
  @JsonTransform(ProductSpecsDto)
  specs: ProductSpecsDto;

  @IsNotEmpty()
  @JsonTransform()
  @IsNumberTupleArray()
  frGraphData: [number, number][];

  @IsOptional()
  @IsString()
  threeModelId?: string;

  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;

  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  @JsonTransform(ImageDto)
  images: ImageDto[];
}
