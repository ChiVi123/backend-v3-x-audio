import type { Readable } from 'node:stream';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProductDto } from '~/applications/dtos/create-product.dto';
import { IsBufferOrReadable } from '~/infrastructure/validations/is-buffer-or-readable.decorator';

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsBufferOrReadable()
  file?: Buffer | Readable;

  @IsBoolean()
  isPrimary: boolean;
}

export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['images'] as const)) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateImageDto)
  images?: UpdateImageDto[];
}
