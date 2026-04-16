import { jsonb, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import type { ImageId } from '~/domain/types/branded.type';
import { timestamps } from '~/infrastructure/database/drizzle/schema/base.schema';

export const imageStatusEnum = pgEnum('image_status', ['pending', 'uploaded', 'error']);

export const imageTable = pgTable('image', {
  id: uuid('id').primaryKey().notNull().$type<ImageId>(),
  url: varchar('url', { length: 255 }).notNull(),
  alt: varchar('alt', { length: 255 }).notNull(),
  remoteKey: varchar('remote_key', { length: 255 }),
  provider: varchar('provider', { length: 255 }),
  metadata: jsonb('metadata').$type<{
    width: number;
    height: number;
    format: string;
    bytes: number;
  }>(),
  status: imageStatusEnum().default('pending').notNull(),
  ...timestamps,
});
