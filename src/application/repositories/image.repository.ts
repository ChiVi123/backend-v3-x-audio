import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ImageId } from '~/domain/types/branded.type';

export interface ImageRepository {
  findByRemoteKey(remoteKey: string): Promise<ImageEntity | null>;
  delete(id: ImageId): Promise<void>;
}
