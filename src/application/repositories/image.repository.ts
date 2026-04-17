import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ImageId } from '~/domain/types/branded.type';

export interface ImageRepository {
  findByRemoteKey(remoteKey: string): Promise<ImageEntity | null>;
  create(data: CreateImageInput): Promise<ImageEntity>;
  createMany(data: CreateImageInput[]): Promise<ImageEntity[]>;
  update(id: ImageId, data: UpdateImageInput): Promise<ImageEntity>;
  updateMany(data: UpdateImageInput[]): Promise<ImageEntity[]>;
  delete(id: ImageId): Promise<void>;
  deleteMany(ids: ImageId[]): Promise<void>;
}

export type CreateImageInput = Omit<ImageEntity, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateImageInput = Partial<CreateImageInput>;
