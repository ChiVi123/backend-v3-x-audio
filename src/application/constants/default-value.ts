import type { ImageEntity } from '~/domain/entities/image.entity';
import { ImageStatus } from '~/domain/enums/image.enum';

export const PENDING_IMAGE_DEFAULT: Omit<ImageEntity, 'id' | 'createdAt' | 'updatedAt'> = {
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
};
