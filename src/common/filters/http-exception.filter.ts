import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let status = exception.getStatus();
    let exceptionResponse = exception.getResponse();
    let message: string;
    if (typeof exceptionResponse === 'string') message = exceptionResponse;
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const msg = (exceptionResponse as any).message;
      message = Array.isArray(msg) ? msg.join(', ') : msg;
    }
    return response.status(status).json({
      status: false,
      message,
    });
  }
}
