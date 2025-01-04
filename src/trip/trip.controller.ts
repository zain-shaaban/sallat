import { Controller, Post, Body, HttpStatus, Get } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CustomerSearchDtoRequest,
  CustomerSearchDtoResponse,
} from './dto/customer-search.dto';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @ApiOperation({ summary: 'submit new trip' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        status: true,
        data: { tripID: 3100 },
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

  @ApiOperation({ summary: 'Get a single customer by his phone number' })
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
  @Get('customerSearch')
  async customerSearch(@Body() customerSearchDto: CustomerSearchDtoRequest) {
    return await asyncHandler(
      this.tripService.customerSearch(customerSearchDto.phoneNumber),
    );
  }
}
