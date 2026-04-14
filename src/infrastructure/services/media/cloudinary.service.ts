import type { Readable } from 'node:stream';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type { MediaService, UploadMediaResponse } from '~/core/services/media.service';
import type { EnvironmentVariables } from '~/infrastructure/validations/env.validation';

@Injectable()
export class CloudinaryService implements MediaService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      api_key: this.configService.get('CLOUDINARY_API_KEY', { infer: true }),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET', { infer: true }),
    });
  }

  upload(file: Buffer | Readable, folder: string): Promise<UploadMediaResponse> {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new BadRequestException('Image buffer is empty or missing. Please check your upload payload.'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `v3x_audio/${folder}`, resource_type: 'auto' },
        (error, result: UploadApiResponse) => {
          if (error) {
            console.error('[Cloudinary Service] Upload Failed', error);
            return reject(new InternalServerErrorException('Cloudinary Upload Failed'));
          }

          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      if (Buffer.isBuffer(file)) {
        uploadStream.end(file);
      } else {
        file.pipe(uploadStream);
      }
    });
  }
  async delete(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        throw new Error(`Cloudinary returned: ${result.result}`);
      }
    } catch (error) {
      console.error(`[Cloudinary Service] Delete Failed for ID: ${publicId}`, error);
      throw new InternalServerErrorException('Cloudinary Delete Failed');
    }
  }
}
