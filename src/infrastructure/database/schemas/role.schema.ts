import { pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { RoleId } from '~/core/types/branded.type';
import { timestamps } from '~/infrastructure/database/schemas/base.schema';
import { userTable } from '~/infrastructure/database/schemas/user.schema';

export const roleTable = pgTable('role', {
  id: uuid('id').primaryKey().defaultRandom().$type<RoleId>(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  ...timestamps,
});

export const userRoleTable = pgTable(
  'user_role',
  {
    userId: uuid('user_id')
      .references(() => userTable.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: uuid('role_id')
      .references(() => roleTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);
