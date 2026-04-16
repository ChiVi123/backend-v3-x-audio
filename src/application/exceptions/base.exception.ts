import { APPLICATION_EXCEPTION_NAME } from '~/application/constants/exception';

export abstract class BaseException extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = APPLICATION_EXCEPTION_NAME;
  }
}
