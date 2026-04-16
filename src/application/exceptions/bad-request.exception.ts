import { BAD_REQUEST_EXCEPTION_CODE } from '~/application/constants/exception';
import { BaseException } from '~/application/exceptions/base.exception';

export class BadRequestException extends BaseException {
  constructor(message: string) {
    super(message, BAD_REQUEST_EXCEPTION_CODE, 400);
  }
}
