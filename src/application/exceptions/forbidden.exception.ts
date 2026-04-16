import { FORBIDDEN_EXCEPTION_CODE } from '~/application/constants/exception';
import { BaseException } from '~/application/exceptions/base.exception';

export class ForbiddenException extends BaseException {
  constructor(message: string) {
    super(message, FORBIDDEN_EXCEPTION_CODE, 403);
  }
}
