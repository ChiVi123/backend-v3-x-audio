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
import { DriverType, ProductStatus } from '~/domain/enums/product.enum';
import { IsNumberTupleArray } from '~/presentation/decorators/is-number-tuple-array.decorator';
import { JsonTransform } from '~/presentation/decorators/json-transform.decorator';

class FrequencyResponseDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max: number;
}

class ProductSpecsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  impedance: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  sensitivity: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => FrequencyResponseDto)
  frequencyResponse: FrequencyResponseDto;

  @IsNotEmpty()
  @IsEnum(DriverType)
  driverType: DriverType;

  [key: string]: unknown;
}

class ImageDto {
  @IsNotEmpty()
  @IsString()
  alt: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

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
