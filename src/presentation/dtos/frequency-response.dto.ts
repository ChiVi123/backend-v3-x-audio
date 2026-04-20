import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class FrequencyResponseDto {
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
