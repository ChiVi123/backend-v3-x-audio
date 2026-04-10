import type { ImageId } from '~/core/types/branded.type';

export interface Image {
  id: ImageId;
  publicId: string;
  url: string;
  altText?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  /**
   * This field will be mapped from the Join Table when querying
   */
  isPrimary?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
