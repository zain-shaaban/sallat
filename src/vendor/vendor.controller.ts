import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import {
  CreateVendorDtoRequest,
  CreateVendorDtoResponse,
} from './dto/create-vendor.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllVendorsDto } from './dto/get-all-vendors.dto';
import { GetSingleVendorDto } from './dto/get-single-vendor.dto';
import { GetAllVendorsOnMapDto } from './dto/get-all-vendors-on-map.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';

@ApiBearerAuth('JWT-auth')
@ApiTags('Vendors')
@UseGuards(AccountAuthGuard, RolesGuard)
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiOperation({
    summary: 'Create new vendor',
    description: `
Creates a new vendor in the system. This endpoint allows you to register a new vendor with their basic information including name, phone number, and location.

Required fields:
- name: The name of the vendor business
- phoneNumber: Contact number in international format
- location: Geographic coordinates and description

The response includes the newly created vendor's ID.
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateVendorDtoResponse,
    description: 'The vendor has been successfully added',
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
  @Roles(AccountRole.CC, AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Post('add')
  async create(@Body() createVendorDto: CreateVendorDtoRequest) {
    return await this.vendorService.create(createVendorDto);
  }

  @ApiOperation({
    summary: 'Get all vendors',
    description: `
Retrieves a list of all vendors in the system. This endpoint returns comprehensive information about each vendor including their basic details, location, and associated trips.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsDto,
    description: 'List of vendors retrieved successfully',
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
  @Roles(AccountRole.CC, AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get('')
  async findAll() {
    return await this.vendorService.findAll();
  }

  @ApiOperation({
    summary: 'Update vendor',
    description: `
Updates an existing vendor's information.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The unique identifier of the vendor',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: {
      example: {
        status: false,
        message:
          'Vendor with this ID not 3c559f4a-ef14-4e62-8874-384a89c8689e found',
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
  @Roles(AccountRole.CC, AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Patch('update/:vendorID')
  async update(
    @Param('vendorID') vendorID: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return await this.vendorService.update(vendorID, updateVendorDto);
  }

  @ApiOperation({
    summary: 'Get vendors on map',
    description: `
Retrieves all vendors with their location data optimized for map display.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsOnMapDto,
    description: 'List of vendors with location data retrieved successfully',
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
  @Roles(AccountRole.CC, AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get('onMap')
  async findAllOnMap() {
    return await this.vendorService.findOnMap();
  }

  @ApiOperation({
    summary: 'Delete vendor',
    description: `
Permanently deletes a vendor from the system.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The unique identifier of the vendor to delete',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: {
      example: {
        status: false,
        message:
          'Vendor with this ID 3c559f4a-ef14-4e62-8874-384a89c8689e not found',
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
  @Roles(AccountRole.SUPERADMIN)
  @Delete('delete/:vendorID')
  async remove(@Param('vendorID') vendorID: string) {
    return await this.vendorService.remove(vendorID);
  }

  @ApiOperation({
    summary: 'Get vendor by ID',
    description: `
Retrieves detailed information about a specific vendor. `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor found successfully',
    type: GetSingleVendorDto,
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The unique identifier of the vendor',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: {
      example: {
        status: false,
        message:
          'Vendor with this ID 3c559f4a-ef14-4e62-8874-384a89c8689e not found',
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
  @Roles(AccountRole.CC, AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Get(':vendorID')
  async findOne(@Param('vendorID') vendorID: string) {
    return await this.vendorService.findOne(vendorID);
  }
}
