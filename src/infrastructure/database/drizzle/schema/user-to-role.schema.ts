import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { roleTable } from '~/infrastructure/database/drizzle/schema/role.schema';
import { userTable } from '~/infrastructure/database/drizzle/schema/user.schema';

export const userToRoleTable = pgTable(
  'user_to_role',
  {
    userId: uuid('user_id')
      .references(() => userTable.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: uuid('role_id')
      .references(() => roleTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);
