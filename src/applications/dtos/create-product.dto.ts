import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { DriverType } from '~/core/types/product.type';

class ImageDto {
  @IsOptional()
  file: Buffer;

  @IsBoolean()
  isPrimary: boolean;
}

class FrequencyResponseDto {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;
}

class SpecsDto {
  @IsNumber()
  @Min(0)
  impedance: number;

  @IsNumber()
  @Min(0)
  sensitivity: number;

  @ValidateNested()
  @Type(() => FrequencyResponseDto)
  frequencyResponse: FrequencyResponseDto;

  @IsEnum(DriverType)
  driverType: DriverType;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SpecsDto)
  specs: SpecsDto;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  frGraphData: string[][];

  @IsString()
  @IsOptional()
  threeModelId?: string;

  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  @IsArray()
  @ArrayNotEmpty()
  images: ImageDto[];
}
