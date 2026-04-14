/** biome-ignore-all lint/suspicious/noExplicitAny: For database exception */
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch() // Can specify errors from Postgres driver if needed
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. If it is a standard HttpException (400, 401, 403, 404...), let it handle itself
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    // Check for 23505 error (Unique Violation)
    if (exception?.code === '23505') {
      const detail = exception.detail; // Postgres usually returns "Key (name)=(...) already exists"
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Data already exists in the system',
        error: 'Conflict',
        detail: detail,
      });
    }

    // Foreign Key Violation (e.g., deleting a category that has products)
    if (exception?.code === '23503') {
      const detail = exception.detail; // Postgres usually returns "Key (name)=(...) already exists"
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot delete this resource because it is being used by another resource',
        error: 'Bad Request',
        detail: detail,
      });
    }

    console.error('[DatabaseExceptionFilter] Unhandled Error:', exception);
    // Default to return the original error if it's not the DB error we want
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
