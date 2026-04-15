import { pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { ImageId, UserId } from '~/core/types/branded.type';
import { timestamps } from '~/infrastructure/database/schemas/base.schema';
import { imageTable } from '~/infrastructure/database/schemas/image.schema';

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'blocked']);

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom().$type<UserId>(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatarImageId: uuid('avatar_image_id')
    .references(() => imageTable.id, { onDelete: 'set null' })
    .$type<ImageId>(),
  refreshTokenHash: text('refresh_token_hash'),
  status: userStatusEnum('status').default('active').notNull(),
  ...timestamps,
});
