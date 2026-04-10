import { Global, Module } from '@nestjs/common';
import { MediaService } from '~/core/services/media.service';
import { CloudinaryService } from '~/infrastructure/services/media/cloudinary.service';

@Global()
@Module({
  providers: [
    {
      provide: MediaService,
      useClass: CloudinaryService,
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
