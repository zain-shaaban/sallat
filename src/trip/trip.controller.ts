import { Controller, Post, Body, HttpStatus, Get, Param } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerSearchDtoResponse } from './dto/customer-search.dto';
import { GetAllTripsDto } from './dto/get-all-trips.dto';
import { GetSingleTripDto } from './dto/get-single-trip.dto';
import { sendLocationDto } from './dto/new-location.dto';

@ApiTags('Trips')
@ApiBearerAuth('JWT-auth')
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @ApiOperation({
    summary: 'Create a new trip',
    description: `
Creates a new trip with the provided details. The trip can be either a regular delivery trip or an alternative trip.

### Regular Trip
- Requires vendor and customer information
- Includes item types, description, and pricing details
- Can be assigned to a driver immediately or left pending

### Alternative Trip
- Only requires customer information
- Used for special delivery cases
- Can be assigned to a driver immediately or left pending

### Response
- Returns the created trip ID
- For new vendors, also returns the vendor ID
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        status: true,
        data: {
          tripID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
          vendorID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
        },
      },
    },
    description: 'The trip has been successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        status: false,
        message: 'validation error',
      },
    },
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
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

  @ApiOperation({
    summary: 'Send new location for offline driver',
    description: `
Updates the location of a driver when they are offline. This endpoint is used to track driver locations even when they are not actively connected to the system.

    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
    description: 'The new location has been successfully recorded',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        status: false,
        message: 'validation error',
      },
    },
    description: 'Invalid location data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
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

  @ApiOperation({
    summary: 'Get trip details',
    description: `
Retrieves detailed information about a specific trip using its ID.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trip found successfully',
    type: GetSingleTripDto,
  })
  @ApiParam({
    name: 'tripID',
    description: 'The unique identifier of the trip',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trip not found',
    schema: {
      example: {
        status: false,
        message: 'not found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
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

  @ApiOperation({
    summary: 'Get all trips',
    description: `
Retrieves a list of all trips in the system
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trips retrieved successfully',
    type: GetAllTripsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @Get('/')
  async getAllTrips() {
    return await asyncHandler(this.tripService.findAll());
  }

  @ApiOperation({
    summary: 'Search customer by phone number',
    description: `
Searches for customers in the system using their phone number.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer found successfully',
    type: CustomerSearchDtoResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No customer found with the provided phone number',
    schema: {
      example: {
        status: false,
        message: 'not found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @ApiParam({
    name: 'phoneNumber',
    description: 'The phone number to search for',
    type: String,
    example: '+1234567890',
  })
  @Get('/customerSearch/:phoneNumber')
  async searchCustomers(@Param('phoneNumber') phoneNumber: string) {
    return await asyncHandler(this.tripService.customerSearch(phoneNumber));
  }
}
