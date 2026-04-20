import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { InternalServerErrorException } from '~/application/exceptions/internal-server-error.exception';
import type { MediaService } from '~/application/services/media.service';
import type { FileUpload, ImageResponse } from '~/application/types/media.type';
import type { EnvironmentVariables } from '~/config/env.validation';

@Injectable()
export class CloudinaryService implements MediaService<ImageResponse> {
  private readonly folder: string;

  constructor(configService: ConfigService<EnvironmentVariables>) {
    const rootFolder = configService.get('CLOUDINARY_BASE_FOLDER', { infer: true }) ?? 'v3-x-audio';
    const envFolder = configService.get('NODE_ENV', { infer: true }) ?? 'development';
    this.folder = `${rootFolder}/${envFolder}/products`;
  }

  async upload(file: FileUpload): Promise<ImageResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          /* [Best Practice]: Don't set crop, format, webp here!
             Best practice is to create an "Upload Preset" on Cloudinary Dashboard,
             then pass the preset name here => config will be completely separated from the code.
             Example: upload_preset: 'audio_product_preset'
          */
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            Logger.error(error, 'CloudinaryService.upload');
            reject(new InternalServerErrorException(`Error when upload image ${file.originalname} to Cloudinary`));
            return;
          }

          resolve({
            remoteKey: result.public_id,
            url: result.secure_url,
            alt: file.originalname,
            provider: 'cloudinary',
            metadata: {
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            },
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultiple(files: FileUpload[]): Promise<PromiseSettledResult<ImageResponse>[]> {
    const result = await Promise.allSettled(files.map((file) => this.upload(file)));
    return result;
  }

  async delete(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
    } catch (e) {
      Logger.error(e, 'CloudinaryService.delete');
      throw new InternalServerErrorException(`Can't delete image from Cloudinary: ${key}`);
    }
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(keys);
    } catch (e) {
      Logger.error(e, 'CloudinaryService.deleteMultiple');
      throw new InternalServerErrorException(`Can't delete images from Cloudinary: ${keys.join(', ')}`);
    }
  }
}
