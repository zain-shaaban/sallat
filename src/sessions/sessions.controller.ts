import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMultipleSessionsDto } from './dto/create-multiple-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return await this.sessionsService.create(createSessionDto);
  }

  @Post('multiple')
  async createMultiple(@Body() createMultipleSessionsDto: CreateMultipleSessionsDto) {
    return await this.sessionsService.createMultiple(createMultipleSessionsDto.sessions)
  }

  @Get()
  async findAll() {
    return await this.sessionsService.findAll();
  }
  
  @Get('driverID/:driverID')
  async findByDriverID(@Param('driverID') driverID: string) {
    return this.sessionsService.findByDriverID(driverID);
  }

  @Get('vehicleNumber/:vehicleNumber')
  async findByVehicleNumber(@Param('vehicleNumber') vehicleNumber: string) {
    return this.sessionsService.findByVehicleNumber(vehicleNumber);
  }

  @Get('driver/:driverID/vehicle/:vehicleNumber')
  async findByDriverAndVehicle(
    @Param('driverID') driverID: string,
    @Param('vehicleNumber') vehicleNumber: string
  ) {
    return this.sessionsService.findByDriverAndVehicle(driverID, vehicleNumber);
  }

  @Delete()
  async removeAll() {
    return this.sessionsService.removeAll();
  }
}
