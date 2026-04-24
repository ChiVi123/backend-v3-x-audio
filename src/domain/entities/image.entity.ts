import type { BaseEntity } from '~/domain/entities/base.entity';
import type { ImageStatus } from '~/domain/enums/image.enum';
import type { ImageId } from '~/domain/types/branded.type';

/**
 * Image Entity
 * @property id - Image ID
 * @property url - Image URL
 * @property alt - Image alt text
 * @property remoteKey - Image remote key (e.g. cloudinary, s3 key)
 * @property metadata - Image metadata
 * @property status - Image status
 */
export interface ImageEntity extends BaseEntity<ImageId> {
  url: string;
  alt: string;
  remoteKey?: string;
  provider?: string;
  isPrimary?: boolean;
  metadata?: {
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  status: ImageStatus;
}
