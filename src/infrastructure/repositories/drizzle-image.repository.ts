import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InternalServerErrorException } from '~/application/exceptions/internal-server-error.exception';
import { ImageMapper } from '~/application/mappers/image.mapper';
import type {
  CreateImageInput,
  ImageRepository,
  UpdateImageInput,
  UpdateManyImageInput,
} from '~/application/repositories/image.repository';
import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ImageId } from '~/domain/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { IMAGE_COLUMNS } from '~/infrastructure/database/drizzle/constants/columns';
import { imageTable } from '~/infrastructure/database/drizzle/schema';

@Injectable()
export class DrizzleImageRepository implements ImageRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleSchema>) {}

  async findByIds(ids: ImageId[]): Promise<ImageEntity[]> {
    if (ids.length === 0) {
      return [];
    }
    const results = await this.db.query.imageTable.findMany({
      where: (t) => inArray(t.id, ids),
      columns: IMAGE_COLUMNS,
    });

    return results.map(ImageMapper.toDomain);
  }

  async create(image: CreateImageInput): Promise<ImageEntity> {
    const result = await this.db.insert(imageTable).values(image).returning();
    if (!result[0]) {
      throw new InternalServerErrorException('Failed to create image');
    }
    return ImageMapper.toDomain(result[0]);
  }

  async createMany(images: CreateImageInput[]): Promise<ImageEntity[]> {
    if (images.length === 0) {
      return [];
    }

    const results = await this.db.insert(imageTable).values(images).returning();
    return results.map(ImageMapper.toDomain);
  }

  async update(id: ImageId, image: UpdateImageInput): Promise<ImageEntity> {
    const result = await this.db.update(imageTable).set(image).where(eq(imageTable.id, id)).returning();
    if (!result[0]) {
      throw new InternalServerErrorException('Failed to update image');
    }
    return ImageMapper.toDomain(result[0]);
  }

  async updateMany(images: UpdateManyImageInput[]): Promise<ImageEntity[]> {
    if (images.length === 0) {
      return [];
    }
    const results = await this.db.transaction(async (tx) => {
      // FIXME: optimize this
      const updates = images
        .filter(({ id, ...data }) => Object.values(data).some((pro) => pro !== undefined) && id !== undefined)
        .map(({ id, ...data }) => tx.update(imageTable).set(data).where(eq(imageTable.id, id)).returning());
      const updateResults = await Promise.all(updates);
      return updateResults.flat();
    });

    return results.map(ImageMapper.toDomain);
  }

  async delete(id: ImageId): Promise<void> {
    await this.db.delete(imageTable).where(eq(imageTable.id, id));
  }

  async deleteMany(ids: ImageId[]): Promise<void> {
    await this.db.delete(imageTable).where(inArray(imageTable.id, ids));
  }
}
