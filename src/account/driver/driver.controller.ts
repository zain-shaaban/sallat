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
import { DriverService } from './driver.service';
import {
  CreateDriverDtoRequest,
  CreateDriverDtoResponse,
} from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetSingleDriverDto } from './dto/get-single-driver.dto';
import { GetAllDriversDto } from './dto/get-all-drivers.dto';

@ApiBearerAuth()
@ApiTags('Account - Driver')
@Controller('account/driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @ApiOperation({ summary: 'Create new driver' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateDriverDtoResponse,
    description: 'The driver has been successfully added',
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
  async create(@Body() createDriverDto: CreateDriverDtoRequest) {
    return await asyncHandler(this.driverService.create(createDriverDto));
  }

  @ApiOperation({ summary: 'Get all drivers and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllDriversDto,
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
    return await asyncHandler(this.driverService.findAll());
  }

  @ApiOperation({ summary: 'Get a single driver by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Driver found successfully',
    type: GetSingleDriverDto,
  })
  @ApiParam({
    name: 'driverID',
    description: 'The ID of the driver',
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
  @Get('get/:driverID')
  async findOne(@Param('driverID') driverID: string) {
    return await asyncHandler(this.driverService.findOne(driverID));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Driver updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'driverID',
    description: 'The ID of the driver',
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
  @ApiOperation({ summary: 'Update single driver data' })
  @Patch('update/:driverID')
  async update(
    @Param('driverID') driverID: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return await asyncHandler(
      this.driverService.update(driverID, updateDriverDto),
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Driver deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'driverID',
    description: 'The ID of the driver',
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
  @ApiOperation({ summary: 'Delete single driver' })
  @Delete('delete/:driverID')
  async remove(@Param('driverID') driverID: string) {
    return await asyncHandler(this.driverService.remove(driverID));
  }
}
