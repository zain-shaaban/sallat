import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMultipleSessionsDto } from './dto/create-multiple-session.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Session } from './entities/session.entity';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';

@ApiBearerAuth('JWT-auth')
@ApiTags('Sessions')
@UseGuards(AccountAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiOperation({
    summary: 'Create new session',
    description: 'Creates a new session',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The session has been successfully created.',
    type: CreateSessionDto,
    example: {
      status: true,
      data: {
        sessionID: 'f7e24c8a-2d77-4e44-a528-1e8f9c3f7c77',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: {
      example: {
        status: false,
        message: 'Validation error',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.DRIVER)
  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return await this.sessionsService.create(createSessionDto);
  }

  @ApiOperation({
    summary: 'Create multiple sessions',
    description: 'Creates multiple sessions in a single request.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The sessions have been successfully created.',
    example: {
      status: true,
      data: {
        sessionIDs: [
          '3c559f4a-ef14-4e62-8874-384a89c8689e',
          'f7e24c8a-2d77-4e44-a528-1e8f9c3f7c77',
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: {
      example: {
        status: false,
        message: 'Validation error',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.DRIVER)
  @Post('multiple')
  async createMultiple(
    @Body() createMultipleSessionsDto: CreateMultipleSessionsDto,
  ) {
    return await this.sessionsService.createMultiple(
      createMultipleSessionsDto.sessions,
    );
  }

  @ApiOperation({
    summary: 'Get all sessions',
    description:
      'Retrieves a list of all sessions with their complete details.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sessions retrieved successfully.',
    type: [Session],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get()
  async findAll() {
    return await this.sessionsService.findAll();
  }

  @ApiOperation({
    summary: 'Get sessions by driver ID',
    description: 'Retrieves all sessions associated with a specific driver ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sessions retrieved successfully.',
    type: [Session],
  })
  @ApiParam({
    name: 'driverID',
    description: 'The unique identifier of the driver',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get('driverID/:driverID')
  async findByDriverID(@Param('driverID') driverID: string) {
    return this.sessionsService.findByDriverID(driverID);
  }

  @ApiOperation({
    summary: 'Get sessions by vehicle number',
    description:
      'Retrieves all sessions associated with a specific vehicle number.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sessions retrieved successfully.',
    type: [Session],
  })
  @ApiParam({
    name: 'vehicleNumber',
    description: 'The vehicle number to search for',
    type: String,
    example: 'ABC123',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get('vehicleNumber/:vehicleNumber')
  async findByVehicleNumber(@Param('vehicleNumber') vehicleNumber: string) {
    return this.sessionsService.findByVehicleNumber(vehicleNumber);
  }

  @ApiOperation({
    summary: 'Get sessions by driver ID and vehicle number',
    description:
      'Retrieves all sessions associated with both a specific driver ID and vehicle number.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sessions retrieved successfully.',
    type: [Session],
  })
  @ApiParam({
    name: 'driverID',
    description: 'The unique identifier of the driver',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiParam({
    name: 'vehicleNumber',
    description: 'The vehicle number to search for',
    type: String,
    example: 'ABC123',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get('driver/:driverID/vehicle/:vehicleNumber')
  async findByDriverAndVehicle(
    @Param('driverID') driverID: string,
    @Param('vehicleNumber') vehicleNumber: string,
  ) {
    return this.sessionsService.findByDriverAndVehicle(driverID, vehicleNumber);
  }

  @ApiOperation({
    summary: 'Delete all sessions',
    description: 'Deletes all sessions from the system. Use with caution.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All sessions have been successfully deleted.',
    schema: {
      example: { status: true, data: null },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Delete()
  async removeAll() {
    return this.sessionsService.removeAll();
  }
}
