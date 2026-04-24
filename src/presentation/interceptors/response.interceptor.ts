import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { map, type Observable } from 'rxjs';
import type { PaginatedResult, PaginationMetadata } from '~/application/types/pagination.type';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMetadata;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data): ApiResponse<T> => {
        let pagination: PaginationMetadata | undefined;
        let responseData = data;

        // Check if data is a PaginatedResult
        if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
          const paginated = data as PaginatedResult<unknown>;
          responseData = paginated.data as T;
          pagination = paginated.pagination;
        }

        return {
          statusCode,
          message: 'Success',
          data: responseData,
          pagination,
        };
      }),
    );
  }
}
