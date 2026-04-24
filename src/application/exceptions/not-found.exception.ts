import { NOT_FOUND_EXCEPTION_CODE } from '~/application/constants/exception';
import { BaseException } from '~/application/exceptions/base.exception';

export class NotFoundException extends BaseException {
  constructor(entityName: string, key: string, value: string) {
    super(`${entityName} with ${key} ${value} not found`, NOT_FOUND_EXCEPTION_CODE, 404);
  }
}
