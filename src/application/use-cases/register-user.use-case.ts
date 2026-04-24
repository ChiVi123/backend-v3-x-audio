import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import type { UserRepository, UserWithRolesAndAvatar } from '~/application/repositories/user.repository';
import type { AuthService } from '~/application/services/auth.service';
import { UserStatus } from '~/domain/enums/user.enum';

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserWithRolesAndAvatar> {
    const exists = await this.userRepository.existsByEmail(input.email);
    if (exists) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await this.authService.hashPassword(input.password);

    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      status: UserStatus.ACTIVE,
    });

    return { ...user, roles: [], avatar: undefined };
  }
}
