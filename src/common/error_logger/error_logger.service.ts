import { Injectable, LoggerService, LogLevel, NotFoundException } from '@nestjs/common';
import { ErrorLogger } from './entities/error_logger.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ErrorLoggerService implements LoggerService {
  constructor(
    @InjectRepository(ErrorLogger)
    private errorLoggerRepository: Repository<ErrorLogger>,
  ) {}

  async error(message: string, stack: string) {
    await this.errorLoggerRepository.insert({ message, stack });
  }

  async findAll() {
    return await this.errorLoggerRepository.find({
      select: ['errorID', 'message', 'timestamp'],
    });
  }

  async findOne(errorID: number) {
    const error = await this.errorLoggerRepository.findOneBy({ errorID });
    if (!error) throw new NotFoundException('Error not found');
    return error;
  }
  log(message: string) {}

  warn(message: string) {}

  debug(message: string) {}

  verbose(message: string) {}
}
