import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CustomerSearchDtoResponse } from './dto/customer-search.dto';
import { GetAllTripsDto } from './dto/get-all-trips.dto';
import { GetSingleTripDto } from './dto/get-single-trip.dto';
import { sendLocationDto } from './dto/new-location.dto';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @ApiOperation({ summary: 'submit new trip' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        status: true,
        data: { tripID: '3c559f4a-ef14-4e62-8874-384a89c8689e' },
      },
    },
    description: 'The trip has been successfully submited',
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
  @Post('submit')
  async createTrip(@Body() createTripDto: CreateTripDto) {
    return await asyncHandler(this.tripService.createNewTrip(createTripDto));
  }

  @ApiOperation({ summary: 'Get all trips' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllTripsDto,
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
  @Get('')
  async findAll() {
    return await asyncHandler(this.tripService.findAll());
  }

  @ApiOperation({ summary: 'Get a single customer by his phone number' })
  @ApiParam({
    name: 'phoneNumber',
    type: String,
    description: 'Customer number to find his trips',
    example: '+9639998877',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer found successfully',
    type: CustomerSearchDtoResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong Phone Number',
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
  @Get('customerSearch/:phoneNumber')
  async customerSearch(@Param('phoneNumber') phoneNumber: string) {
    return await asyncHandler(this.tripService.customerSearch(phoneNumber));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'tripID',
    description: 'The ID of the trip',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
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
  @ApiOperation({ summary: 'Delete single trip' })
  @Delete('delete/:tripID')
  async remove(@Param('tripID') tripID: string) {
    return await asyncHandler(this.tripService.remove(tripID));
  }

  @ApiOperation({ summary: 'send new location if the driver is offline' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
    description: 'The new location has been successfully sent',
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
  @Post('sendLocation')
  async sendNewLocationIfDriverOffline(
    @Body() sendLocationDto: sendLocationDto,
  ) {
    return await asyncHandler(
      this.tripService.sendNewLocation(sendLocationDto),
    );
  }

  @ApiOperation({ summary: 'Get a single trip by tripID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip found successfully',
    type: GetSingleTripDto,
  })
  @ApiParam({
    name: 'tripID',
    description: 'The ID of the trip',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
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
  @Get('/get/:tripID')
  async findOne(@Param('tripID') tripID: string) {
    return await asyncHandler(this.tripService.findOne(tripID));
  }
}
