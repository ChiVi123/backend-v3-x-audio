import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { UnauthorizedException } from '~/application/exceptions/unauthorized.exception';
import type { UserRepository, UserWithRolesAndAvatar } from '~/application/repositories/user.repository';
import type { AuthService, AuthTokens } from '~/application/services/auth.service';
import { UserStatus } from '~/domain/enums/user.enum';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResult {
  user: UserWithRolesAndAvatar;
  tokens: AuthTokens;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    const isPasswordValid = await this.authService.comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.authService.generateTokens({ sub: user.id, email: user.email });

    const refreshTokenHash = await this.authService.hashPassword(tokens.refreshToken);
    await this.userRepository.update(user.id, { refreshTokenHash });

    return {
      user: { ...user, roles: user.roles ?? [], avatar: undefined },
      tokens,
    };
  }
}
