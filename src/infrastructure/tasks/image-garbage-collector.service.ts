import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { MediaService } from '~/core/services/media.service';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { imageTable, productImageTable } from '~/infrastructure/database/schemas/image.schema';

@Injectable()
export class ImageGarbageCollector {
  private readonly logger = new Logger(ImageGarbageCollector.name);

  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>,
    private readonly mediaService: MediaService,
  ) {}

  /**
   * Run every day at midnight to clean up unused images.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting garbage collection process...');

    try {
      // 1. Find orphan images (no link in join table)
      // Or images in 'pending' state for more than 24 hours (due to upload/logic errors)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const orphans = await this.db
        .select({
          id: imageTable.id,
          publicId: imageTable.publicId,
          url: imageTable.url,
        })
        .from(imageTable)
        .leftJoin(productImageTable, eq(imageTable.id, productImageTable.imageId))
        .where(
          or(
            // Case 1: No link to any Product
            isNull(productImageTable.imageId),
            // Case 2: Image in 'pending' state for more than 24 hours (due to upload/logic errors)
            and(sql`${imageTable.url} LIKE '%pending%'`, lt(imageTable.createdAt, oneDayAgo)),
          ),
        );

      if (orphans.length === 0) {
        this.logger.log('No orphan images found.');
        return;
      }

      this.logger.warn(`Found ${orphans.length} orphan images. Deleting...`);

      // 2. Delete on Cloudinary and DB
      const deletePromises = orphans.map(async (img) => {
        try {
          // Only delete on Cloudinary if not a pending image (no real publicId)
          if (!img.url.includes('pending')) {
            await this.mediaService.delete(img.publicId);
          }

          await this.db.delete(imageTable).where(eq(imageTable.id, img.id));
          return { id: img.id, status: 'success' };
        } catch (error) {
          this.logger.error(`Error deleting image ${img.id}:`, error);
          return { id: img.id, status: 'failed' };
        }
      });

      const results = await Promise.all(deletePromises);
      const succeeded = results.filter((r) => r.status === 'success').length;

      this.logger.log(`Garbage collection completed: Deleted ${succeeded}/${orphans.length} images.`);
    } catch (error) {
      this.logger.error('Garbage collection process failed:', error);
    }
  }
}
