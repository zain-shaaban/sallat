import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { logger } from '../error_logger/logger.util';

export async function asyncHandler<T>(task: Promise<T>): Promise<T> {
  try {
    return await task;
  } catch (error) {
    if (error instanceof HttpException)
      throw new HttpException(error.message, error.getStatus());
    if (error?.code === '23505') {
      if (error.table === 'sallat_categories')
        throw new ConflictException('Category already exists');
      throw new ConflictException('Email already exists');
    }
    logger.error(error.message, error.stack);
    throw new InternalServerErrorException(error.message);
  }
}
