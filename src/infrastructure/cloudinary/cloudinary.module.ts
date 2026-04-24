import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { EnvironmentVariables } from '~/config/env.validation';
import { CloudinaryService } from '~/infrastructure/cloudinary/cloudinary.service';
import { MEDIA_SERVICE_TOKEN } from '~/infrastructure/constants/provider-token';

export const CLOUDINARY_PROVIDER = 'CLOUDINARY_CLIENT';

@Module({
  providers: [
    {
      provide: CLOUDINARY_PROVIDER,
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return cloudinary.config({
          cloud_name: configService.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
          api_key: configService.get('CLOUDINARY_API_KEY', { infer: true }),
          api_secret: configService.get('CLOUDINARY_API_SECRET', { infer: true }),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: MEDIA_SERVICE_TOKEN,
      useClass: CloudinaryService,
    },
  ],
  exports: [MEDIA_SERVICE_TOKEN],
})
export class CloudinaryModule {}
