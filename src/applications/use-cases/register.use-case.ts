import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { RegisterUserDto } from '~/applications/dtos/register-user.dto';
import { UserStatus } from '~/core/entities/user.entity';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { RoleRepository } from '~/core/repositories/role.repository';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UserRepository } from '~/core/repositories/user.repository';
import { toUserId } from '~/core/types/branded.type';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly roleRepo: RoleRepository,
  ) {}

  async execute(dto: RegisterUserDto) {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = {
      id: toUserId(crypto.randomUUID()),
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const defaultRole = await this.roleRepo.findByName('customer');
    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not found');
    }
    const finalRoleIds = dto.roleIds?.length ? dto.roleIds : [defaultRole.id];

    return this.userRepo.save(newUser, finalRoleIds);
  }
}
