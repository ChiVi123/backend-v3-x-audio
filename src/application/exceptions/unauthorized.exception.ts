import { UNAUTHORIZED_EXCEPTION_CODE } from '~/application/constants/exception';
import { BaseException } from '~/application/exceptions/base.exception';

export class UnauthorizedException extends BaseException {
  constructor(message: string) {
    super(message, UNAUTHORIZED_EXCEPTION_CODE, 401);
  }
}
