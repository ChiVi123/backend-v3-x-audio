/** biome-ignore-all lint/suspicious/noExplicitAny: Exception can be of any type in a global filter */
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseException } from '~/application/exceptions/base.exception';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'System error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof BaseException) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
      code = 'HTTP_ERROR';
    }

    Logger.error(exception, 'Global Exception Filter');

    response.status(status).json({
      success: false,
      error: {
        code: code,
        message: Array.isArray(message) ? message[0] : message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
