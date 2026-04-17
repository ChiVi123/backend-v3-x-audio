import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { CreateImageInput, ImageRepository, UpdateImageInput } from '~/application/repositories/image.repository';
import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ImageStatus } from '~/domain/enums/image.enum';
import { type ImageId, toImageId } from '~/domain/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { imageTable } from '~/infrastructure/database/drizzle/schema';

@Injectable()
export class DrizzleImageRepository implements ImageRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleSchema>) {}

  async findByRemoteKey(remoteKey: string): Promise<ImageEntity | null> {
    throw new Error('Method not implemented.');
  }

  async create(image: CreateImageInput): Promise<ImageEntity> {
    const result = await this.db.insert(imageTable).values(image).returning();
    if (!result[0]) {
      throw new InternalServerErrorException('Failed to create image');
    }
    const { remoteKey, url, alt, provider, metadata, status, createdAt, updatedAt } = result[0];
    return {
      id: toImageId(result[0].id),
      remoteKey: remoteKey ?? undefined,
      url,
      alt,
      provider: provider ?? undefined,
      metadata: metadata ?? undefined,
      status: status as ImageStatus,
      createdAt,
      updatedAt: updatedAt ?? undefined,
    };
  }

  async createMany(images: CreateImageInput[]): Promise<ImageEntity[]> {
    const result = await this.db.insert(imageTable).values(images).returning();
    return result.map(({ remoteKey, url, alt, provider, metadata, status }) => ({
      id: toImageId(result[0].id),
      remoteKey: remoteKey ?? undefined,
      url,
      alt,
      provider: provider ?? undefined,
      metadata: metadata ?? undefined,
      status: status as ImageStatus,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt ?? undefined,
    }));
  }

  async update(id: ImageId, image: UpdateImageInput): Promise<ImageEntity> {
    const result = await this.db.update(imageTable).set(image).where(eq(imageTable.id, id)).returning();
    if (!result[0]) {
      throw new InternalServerErrorException('Failed to update image');
    }
    const { remoteKey, url, alt, provider, metadata, status, createdAt, updatedAt } = result[0];
    return {
      id: toImageId(result[0].id),
      remoteKey: remoteKey ?? undefined,
      url,
      alt,
      provider: provider ?? undefined,
      metadata: metadata ?? undefined,
      status: status as ImageStatus,
      createdAt,
      updatedAt: updatedAt ?? undefined,
    };
  }

  async updateMany(images: UpdateImageInput[]): Promise<ImageEntity[]> {
    throw new Error('Method not implemented.');
  }

  async delete(id: ImageId): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteMany(ids: ImageId[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async existsByRemoteKey(remoteKey: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
