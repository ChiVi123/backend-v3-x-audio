import type { Role } from '~/core/entities/role.entity';

export abstract class RoleRepository {
  abstract findByName(name: string): Promise<Role | null>;
}
