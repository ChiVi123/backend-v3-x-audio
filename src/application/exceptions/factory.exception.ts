import * as ExceptionCodes from '~/application/constants/exception';
import { BadRequestException } from './bad-request.exception';
import type { BaseException } from './base.exception';
import { ConflictException } from './conflict.exception';
import { ForbiddenException } from './forbidden.exception';
import { InternalServerErrorException } from './internal-server-error.exception';
import { NotFoundException } from './not-found.exception';
import { UnauthorizedException } from './unauthorized.exception';

/**
 * Type for an exception constructor that returns a BaseException.
 * Using any[] for arguments is necessary for generic constructor types in TypeScript
 * when constructors have varying signatures.
 */

// biome-ignore lint/suspicious/noExplicitAny: Type for an exception constructor that returns a BaseException.
type ExceptionConstructor = new (...args: any[]) => BaseException;

const exceptionMap = new Map<string, ExceptionConstructor>();

/**
 * Registers a new exception constructor with a given code.
 */
export function registerException(code: string, exceptionConstructor: ExceptionConstructor): void {
  exceptionMap.set(code, exceptionConstructor);
}

/**
 * Creates an instance of an exception based on its code.
 * @param code The unique exception code.
 * @param args Arguments to pass to the exception constructor.
 * @returns An instance of BaseException.
 */
export function createException(code: string, ...args: unknown[]): BaseException {
  const ExceptionClass = exceptionMap.get(code);

  if (!ExceptionClass) {
    throw new Error(`Exception code ${code} is not supported`);
  }

  // biome-ignore lint/suspicious/noExplicitAny: Using 'as any' here is a controlled internal casting to handle varying constructor parameters
  return new ExceptionClass(...(args as any));
}

// Register built-in exceptions
registerException(ExceptionCodes.BAD_REQUEST_EXCEPTION_CODE, BadRequestException);
registerException(ExceptionCodes.CONFLICT_EXCEPTION_CODE, ConflictException);
registerException(ExceptionCodes.FORBIDDEN_EXCEPTION_CODE, ForbiddenException);
registerException(ExceptionCodes.INTERNAL_SERVER_ERROR_EXCEPTION_CODE, InternalServerErrorException);
registerException(ExceptionCodes.NOT_FOUND_EXCEPTION_CODE, NotFoundException);
registerException(ExceptionCodes.UNAUTHORIZED_EXCEPTION_CODE, UnauthorizedException);
