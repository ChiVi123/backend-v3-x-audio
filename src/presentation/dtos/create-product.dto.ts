import { Type } from 'class-transformer';
import {
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
import type { CreateProductInput } from '~/application/repositories/product.repository';
import type { ProductSpecs } from '~/domain/entities/product.entity';
import { DriverType, ProductStatus } from '~/domain/enums/product.enum';
import type { CategoryId, Decibel, Hertz, Ohm } from '~/domain/types/branded.type';
import { IsNumberTupleArray } from '~/presentation/decorators/is-number-tuple-array.decorator';

class FrequencyResponseDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  min: Hertz;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  max: Hertz;
}

class ProductSpecsDto implements ProductSpecs {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  impedance: Ohm;

  @IsNotEmpty()
  @IsNumber()
  sensitivity: Decibel;

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

export class CreateProductDto implements CreateProductInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  categoryId: CategoryId;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ProductSpecsDto)
  specs: ProductSpecsDto;

  @IsNotEmpty()
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
}
