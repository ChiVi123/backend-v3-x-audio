import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Image } from '~/core/entities/image.entity';
import type { ImageRepository } from '~/core/repositories/image.repository';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { imageTable } from '~/infrastructure/database/schemas';

@Injectable()
export class DrizzleImageRepository implements ImageRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>) {}

  async findByPublicId(publicId: string): Promise<Image | null> {
    const result = await this.db.select().from(imageTable).where(eq(imageTable.publicId, publicId));
    if (result.length === 0) return null;
    return result[0];
  }
}
