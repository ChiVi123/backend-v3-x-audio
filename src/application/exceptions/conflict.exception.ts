import { CONFLICT_EXCEPTION_CODE } from '~/application/constants/exception';
import { BaseException } from '~/application/exceptions/base.exception';

export class ConflictException extends BaseException {
  constructor(entityName: string, key: string, value: string) {
    super(`${entityName} with ${key} ${value} already exists`, CONFLICT_EXCEPTION_CODE, 409);
  }
}
