import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import type { ImageInput } from '~/application/repositories/product.repository';
import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ImageId } from '~/domain/types/branded.type';
import { CreateProductDto } from '~/presentation/dtos/create-product.dto';

class ImageInputDto implements ImageInput {
  @IsUUID()
  id: ImageId;
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  keepImages: ImageInputDto[];
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  removeImageIds?: ImageId[];
  @IsOptional()
  @IsArray()
  @IsBoolean({ each: true })
  newImages?: (Pick<ImageEntity, 'isPrimary'> & { alt?: string })[];
}
