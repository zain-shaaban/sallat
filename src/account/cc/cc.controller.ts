import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { CcService } from './cc.service';
import { CreateCcDtoRequest, CreateCcDtoResponse } from './dto/create-cc.dto';
import { UpdateCcDto } from './dto/update-cc.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllCcDto } from './dto/get-all-cc.dto';
import { GetSingleCcDto } from './dto/get-single-cc.dto';

@ApiBearerAuth()
@ApiTags('Account - Cc')
@Controller('account/cc')
export class CcController {
  constructor(private readonly ccService: CcService) {}

  @ApiOperation({ summary: 'Create new cc' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateCcDtoResponse,
    description: 'The cc has been successfully added',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        status: false,
        message: 'validation error',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @Post('create')
  async create(@Body() createCcDto: CreateCcDtoRequest) {
    return await asyncHandler(this.ccService.create(createCcDto));
  }

  @ApiOperation({ summary: 'Get all cc and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCcDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @Get('getAll')
  async findAll() {
    return await asyncHandler(this.ccService.findAll());
  }

  @ApiOperation({ summary: 'Get a single Cc by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cc found successfully',
    type: GetSingleCcDto,
  })
  @ApiParam({
    name: 'ccID',
    description: 'The ID of the cc',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong ID',
    schema: {
      example: {
        status: false,
        message: 'not found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @Get('get/:ccID')
  async findOne(@Param('ccID') ccID: string) {
    return await asyncHandler(this.ccService.findOne(ccID));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cc updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'ccID',
    description: 'The ID of the Cc',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong ID',
    schema: {
      example: {
        status: false,
        message: 'not found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        status: false,
        message: 'validation error',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @ApiOperation({ summary: 'Update single Cc data' })
  @Patch('update/:ccID')
  async update(
    @Param('ccID') ccID: string,
    @Body() updateCcDto: UpdateCcDto,
  ) {
    return await asyncHandler(this.ccService.update(ccID, updateCcDto));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cc deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'ccID',
    description: 'The ID of the Cc',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong ID',
    schema: {
      example: {
        status: false,
        message: 'not found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @ApiOperation({ summary: 'Delete single Cc' })
  @Delete('delete/:ccID')
  async remove(@Param('ccID') ccID: string) {
    return await asyncHandler(this.ccService.remove(ccID));
  }
}
