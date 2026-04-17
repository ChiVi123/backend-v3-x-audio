import type { ImageEntity } from '~/domain/entities/image.entity';

export type FileUpload = { buffer: Buffer; originalname: string };
export type ImageResponse = Omit<ImageEntity, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
