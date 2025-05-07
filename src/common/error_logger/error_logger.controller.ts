import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ErrorLoggerService } from './error_logger.service';
import { asyncHandler } from '../utils/async-handler';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ErrorLogDto } from './dto/error-log.dto';
import { ErrorLogListDto } from './dto/error-log-list.dto';

@ApiTags('Error Logs')
@Controller('errors')
export class ErrorLoggerController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all error logs' })
  @ApiResponse({
    status: 200,
    description: 'List of error logs retrieved successfully',
    type: [ErrorLogListDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll() {
    return await asyncHandler(this.errorLoggerService.findAll());
  }

  @Get(':errorID')
  @ApiOperation({ summary: 'Get error log by ID' })
  @ApiParam({
    name: 'errorID',
    description: 'ID of the error log to retrieve',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Error log retrieved successfully',
    type: ErrorLogDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Error log not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findOne(@Param('errorID', ParseIntPipe) errorID: number) {
    return await asyncHandler(this.errorLoggerService.findOne(errorID));
  }
}
