/** biome-ignore-all lint/suspicious/noExplicitAny: For database exception */
import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

@Catch() // Can specify errors from Postgres driver if needed
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check for 23505 error (Unique Violation)
    if (exception?.code === '23505') {
      const detail = exception.detail; // Postgres usually returns "Key (name)=(...) already exists"
      return response.status(409).json({
        statusCode: 409,
        message: 'Data already exists in the system',
        error: 'Conflict',
        detail: detail,
      });
    }

    // Default to return the original error if it's not the DB error we want
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
