import type { Image } from '~/core/entities/image.entity';

export abstract class ImageRepository {
  abstract findByPublicId(publicId: string): Promise<Image | null>;
}
