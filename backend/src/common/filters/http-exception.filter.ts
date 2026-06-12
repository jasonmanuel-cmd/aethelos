import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors';
import { logger } from '../logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).id || 'unknown';

    if (exception instanceof AppError && exception.isOperational) {
      logger.warn('Operational error', {
        code: exception.code,
        message: exception.message,
        statusCode: exception.statusCode,
        requestId,
        path: request.url,
      });
      return response.status(exception.statusCode).json({
        title: exception.code,
        status: exception.statusCode,
        detail: exception.message,
        request_id: requestId,
        errors: exception.details || undefined,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exResponse = exception.getResponse();
      logger.warn('HTTP exception', {
        status,
        response: exResponse,
        requestId,
        path: request.url,
      });
      return response.status(status).json({
        title: 'HttpError',
        status,
        detail: typeof exResponse === 'string' ? exResponse : (exResponse as any).message || 'Request failed',
        request_id: requestId,
      });
    }

    logger.error('Unexpected error', {
      error: (exception as Error).message,
      stack: (exception as Error).stack,
      requestId,
      path: request.url,
    });

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      title: 'Internal Error',
      status: 500,
      detail: 'An unexpected error occurred',
      request_id: requestId,
    });
  }
}
