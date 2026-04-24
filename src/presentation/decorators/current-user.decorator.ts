import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TokenPayload } from '~/application/services/auth.service';

export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as TokenPayload;

    return data ? user?.[data] : user;
  },
);
