import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CustomerSearchDtoResponse } from './dto/customer-search.dto';
import { GetAllTripsDto } from './dto/get-all-trips.dto';
import { GetSingleTripDto } from './dto/get-single-trip.dto';
import { sendLocationDto } from './dto/new-location.dto';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { AddNoteDto } from './dto/add-note.dto';

@ApiTags('Trips')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccountAuthGuard, RolesGuard)
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
  @ApiBody({
    type: CreateTripDto,
    description: 'Trip creation data',
    examples: {
      regularTrip: {
        value: {
          driverID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
          vendorID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
          customerID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
          customerPhoneNumber: '+96399887766',
          customerAlternativePhoneNumbers: ['+96399882211', '+96399884433'],
          partner: true,
          itemTypes: ['شاورما', 'بطاطا مقلية'],
          description: 'كتر كتشب',
          approxDistance: 5200,
          approxPrice: 80000,
          approxTime: 133266423,
          fixedPrice: true,
          routedPath: [
            { lng: 111.111, lat: 112.222 },
            { lng: 888.888, lat: 999.999 },
            { lng: 555.555, lat: 333.333 },
          ],
          schedulingDate: Date.now(),
        },
        summary: 'Regular Trip Example',
      },
      alternativeTrip: {
        value: {
          driverID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
          customerID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
          customerPhoneNumber: '+96399887766',
          customerAlternativePhoneNumbers: ['+96399882211', '+96399884433'],
          itemTypes: ['شاورما', 'بطاطا مقلية'],
          description: 'كتر كتشب',
          alternative: true,
          schedulingDate: Date.now(),
        },
        summary: 'Alternative Trip Example',
      },
    },
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
        message: 'Validation error',
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
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.CC)
  @Post('submit')
  async createTrip(@Body() createTripDto: CreateTripDto, @Req() req) {
    return await this.tripService.createNewTrip(
      createTripDto,
      req.user.id,
      req.user.name,
    );
  }

  @ApiOperation({
    summary: 'Add note',
    description: `Add a note for the trip by manager or super admin`,
  })
  @ApiBody({
    type: AddNoteDto,
    description: 'Note content',
    examples: {
      default: {
        value: {
          note: 'لم يرد العميل على الاتصالات.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
    description: 'The note has been successfully added',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        status: false,
        message: 'Validation error',
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
        message: 'Invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trip not found',
    schema: {
      example: {
        status: false,
        message: 'Trip with ID 3c559f4a-ef14-4e62-8874-384a89c8689e not found',
      },
    },
  })
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Patch('addNote')
  async addNote(@Body() addNoteData: AddNoteDto, @Req() req) {
    return await this.tripService.addNoteToTheTrip(
      addNoteData,
      req.user.name,
    );
  }

  @ApiOperation({
    summary: 'Send new location for offline driver',
    description: `
Updates the location of a driver when they are offline. This endpoint is used to track driver locations even when they are not actively connected to the system.`,
  })
  @ApiBody({
    type: sendLocationDto,
    description: 'Driver location data',
    schema: {
      example: {
        driverID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
        location: {
          lat: 58.16543232,
          lng: 36.18875421,
        },
      },
    },
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
        message: 'Validation error',
      },
    },
    description: 'Invalid location data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        status: false,
        message:
          'Driver with ID 3c559f4a-ef14-4e62-8874-384a89c8689e not exist',
      },
    },
    description: 'Driver not found',
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
  @Post('sendLocation')
  async sendNewLocationIfDriverOffline(
    @Body() sendLocationDto: sendLocationDto,
    @Req() req,
  ) {
    return await this.tripService.sendNewLocation(sendLocationDto, req.user.id);
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
        message: 'trip with ID 3c559f4a-ef14-4e62-8874-384a89c8689e not found',
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
  @Roles(AccountRole.CC, AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('/get/:tripID')
  async findOne(@Param('tripID') tripID: string) {
    return await this.tripService.findOne(tripID);
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
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.CC, AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('/')
  async getAllTrips(@Req() req) {
    return await this.tripService.findAll(req.user.id,req.user.role);
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
        message: 'Customer with phone number +96399887766 not found',
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
  @ApiParam({
    name: 'phoneNumber',
    description: 'The phone number to search for',
    type: String,
    example: '+96399887766',
  })
  @Roles(AccountRole.CC, AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('/customerSearch/:phoneNumber')
  async searchCustomers(@Param('phoneNumber') phoneNumber: string) {
    return await this.tripService.customerSearch(phoneNumber);
  }

  @ApiOperation({
    summary: 'Delete a trip',
    description: `
Deletes a specific trip from the system using its ID.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
    description: 'Trip deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trip not found',
    schema: {
      example: {
        status: false,
        message: 'Trip with ID 3c559f4a-ef14-4e62-8874-384a89c8689e not found',
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
  @ApiParam({
    name: 'tripID',
    description: 'The unique identifier of the trip to delete',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @Roles(AccountRole.SUPERADMIN)
  @Delete('/:tripID')
  async remove(@Param('tripID') tripID: string) {
    return await this.tripService.remove(tripID);
  }
}
