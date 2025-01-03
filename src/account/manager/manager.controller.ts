import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import {
  CreateManagerDtoRequest,
  CreateManagerDtoResponse,
} from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllManagersDto } from './dto/get-all-managers';
import { GetSingleManagerDto } from './dto/get-single-manager.dto';

@ApiBearerAuth()
@ApiTags('Account - Manager')
@Controller('account/manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @ApiOperation({ summary: 'Create new manager' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateManagerDtoResponse,
    description: 'The manager has been sumanageressfully added',
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
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Post('create')
  async create(@Body() createManagerDto: CreateManagerDtoRequest) {
    return await asyncHandler(this.managerService.create(createManagerDto));
  }

  @ApiOperation({ summary: 'Get all manager and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllManagersDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Get('getAll')
  async findAll() {
    return await asyncHandler(this.managerService.findAll());
  }

  @ApiOperation({ summary: 'Get a single Manager by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Manager found successfully',
    type: GetSingleManagerDto,
  })
  @ApiParam({
    name: 'managerID',
    description: 'The ID of the manager',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong ID',
    schema: {
      example: {
        status: false,
        message: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Get('get/:managerID')
  async findOne(@Param('managerID', ParseIntPipe) managerID: number) {
    return await asyncHandler(this.managerService.findOne(managerID));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Manager updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'managerID',
    description: 'The ID of the Manager',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong ID',
    schema: {
      example: {
        status: false,
        message: 'Not Found',
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
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @ApiOperation({ summary: 'Update single Manager data' })
  @Patch('update/:managerID')
  async update(
    @Param('managerID', ParseIntPipe) managerID: number,
    @Body() updateManagerDto: UpdateManagerDto,
  ) {
    return await asyncHandler(
      this.managerService.update(managerID, updateManagerDto),
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Manager deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'managerID',
    description: 'The ID of the Manager',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong ID',
    schema: {
      example: {
        status: false,
        message: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @ApiOperation({ summary: 'Delete single Manager' })
  @Delete('delete/:managerID')
  async remove(@Param('managerID', ParseIntPipe) managerID: number) {
    return await asyncHandler(this.managerService.remove(managerID));
  }
}
