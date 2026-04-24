import { pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import type { UserId } from '~/domain/types/branded.type';
import { timestamps } from '~/infrastructure/database/drizzle/schema/base.schema';
import { imageTable } from '~/infrastructure/database/drizzle/schema/image.schema';

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'blocked']);

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().notNull().defaultRandom().$type<UserId>(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatarId: uuid('avatar_id').references(() => imageTable.id, { onDelete: 'set null' }),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
  status: userStatusEnum().default('active').notNull(),
  ...timestamps,
});
