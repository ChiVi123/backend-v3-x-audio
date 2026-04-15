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
import { AudioCategory } from '~/core/entities/product.entity';
import { DriverType } from '~/core/types/product.type';
import { IsCoordinate2D } from '~/infrastructure/decorators/is-coordinate-2d.decorator';

class ImageDto {
  @IsOptional()
  file: Buffer;

  @IsBoolean()
  isPrimary: boolean;
}

class FrequencyResponseDto {
  @IsNumber() @Min(0) min: number;
  @IsNumber() @Min(0) max: number;
}

export class BaseSpecsDto {
  @IsNumber() @Min(0) impedance: number;
  @IsNumber() @Min(0) sensitivity: number;

  @ValidateNested()
  @Type(() => FrequencyResponseDto)
  frequencyResponse: FrequencyResponseDto;

  @IsEnum(DriverType)
  driverType: DriverType;
}

export class InEarSpecsDto extends BaseSpecsDto {
  @IsEnum(['universal', 'custom'])
  @IsOptional()
  fitType?: 'universal' | 'custom';

  @IsNumber()
  @IsOptional()
  @Min(0)
  nozzleSize?: number;
}

export class OverEarSpecsDto extends BaseSpecsDto {
  @IsEnum(['open-back', 'closed-back', 'semi-open'])
  design: 'open-back' | 'closed-back' | 'semi-open';

  @IsString()
  @IsNotEmpty()
  earpadMaterial: string;
}

export class DacAmpSpecsDto extends BaseSpecsDto {
  @IsString()
  @IsNotEmpty()
  chipset: string;

  @IsString()
  @IsNotEmpty()
  maxSampleRate: string;
}

const specsMap = {
  [AudioCategory.IN_EAR]: InEarSpecsDto,
  [AudioCategory.OVER_EAR]: OverEarSpecsDto,
  [AudioCategory.DAC_AMP]: DacAmpSpecsDto,
};

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  categorySlug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @ValidateNested()
  @IsNotEmpty()
  @Type((opts) => specsMap[opts?.object.categorySlug as keyof typeof specsMap] ?? BaseSpecsDto)
  specs: InEarSpecsDto | OverEarSpecsDto | DacAmpSpecsDto | BaseSpecsDto;

  @IsArray()
  @ArrayNotEmpty()
  @IsCoordinate2D()
  frGraphData: [number, number][];

  @IsOptional()
  @IsString()
  threeModelId?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];
}
