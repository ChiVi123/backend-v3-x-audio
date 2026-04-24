import type { BaseEntity } from '~/domain/entities/base.entity';
import type { UserRoleId } from '~/domain/types/branded.type';

export interface RoleEntity extends BaseEntity<UserRoleId> {
  name: string;
  description?: string;
}
