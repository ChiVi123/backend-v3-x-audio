import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, Min, ValidateNested } from 'class-validator';
import { DriverType } from '~/domain/enums/product.enum';
import { FrequencyResponseDto } from '~/presentation/dtos/frequency-response.dto';

export class ProductSpecsDto {
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
