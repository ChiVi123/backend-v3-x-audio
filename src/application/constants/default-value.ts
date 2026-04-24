import type { ImageEntity } from '~/domain/entities/image.entity';
import { ImageStatus } from '~/domain/enums/image.enum';

export const PENDING_IMAGE_DEFAULT: Readonly<Omit<ImageEntity, 'id' | 'createdAt' | 'updatedAt'>> = {
  url: '',
  alt: '',
  remoteKey: '',
  provider: '',
  isPrimary: false,
  metadata: {
    width: 0,
    height: 0,
    format: '',
    bytes: 0,
  },
  status: ImageStatus.PENDING,
} as const;

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_FILES = 6;
export const ALLOWED_IMAGE_MIME_TYPES = /image\/(png|jpeg|jpg|webp)/;
