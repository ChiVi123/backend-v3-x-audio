import { INTERNAL_SERVER_ERROR_EXCEPTION_CODE } from '~/application/constants/exception';
import { BaseException } from '~/application/exceptions/base.exception';

export class InternalServerErrorException extends BaseException {
  constructor(message: string) {
    super(message, INTERNAL_SERVER_ERROR_EXCEPTION_CODE, 500);
  }
}
