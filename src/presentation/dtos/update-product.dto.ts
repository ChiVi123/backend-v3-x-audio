import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { JsonTransform } from '~/presentation/decorators/json-transform.decorator';
import { CreateProductDto } from '~/presentation/dtos/create-product.dto';

class ImageInputDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

class NewImageDto {
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  alt?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  @JsonTransform(ImageInputDto)
  keepImages?: ImageInputDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NewImageDto)
  @JsonTransform(NewImageDto)
  newImages?: NewImageDto[];

  @IsOptional()
  @IsString({ each: true })
  @JsonTransform()
  removeImageIds?: string[];
}
