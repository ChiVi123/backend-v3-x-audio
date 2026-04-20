import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImageDto {
  @IsNotEmpty()
  @IsString()
  alt: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
