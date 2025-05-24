import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { logger } from '../error_logger/logger.util';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message } = this.processException(exception);

    response.status(status).json({
      status: false,
      message,
    });
  }

  private processException(exception: any): {
    status: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (exception?.code === '23505') {
      return this.handleUniqueConstraintError(exception);
    }

    return this.handleUnknownError(exception);
  }

  private handleHttpException(exception: HttpException): {
    status: number;
    message: string;
  } {
    const status = exception.getStatus();
    const response = exception.getResponse();

    const message =
      status === HttpStatus.BAD_REQUEST && typeof response === 'object'
        ? ((response as any).message?.join(' ,') ?? 'Bad Request')
        : exception.message;

    return { status, message };
  }

  private handleUniqueConstraintError(exception: any): {
    status: number;
    message: string;
  } {
    let message = 'Conflict';

    switch (exception.table) {
      case 'sallat_categories':
        message = 'Category already exists';
        break;
      case 'sallat_accounts':
        message = 'Email already exists';
        break;
    }

    return {
      status: HttpStatus.CONFLICT,
      message,
    };
  }

  private handleUnknownError(exception: any): {
    status: number;
    message: string;
  } {
    logger.error(exception.message, exception.stack);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message ?? 'Internal server error',
    };
  }
}
