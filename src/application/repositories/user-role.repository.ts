export interface UserRoleRepository {
  existsByName(name: string): Promise<boolean>;
}
