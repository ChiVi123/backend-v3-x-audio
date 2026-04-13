import type { RoleId } from '~/core/types/branded.type';

export interface Role {
  id: RoleId;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
