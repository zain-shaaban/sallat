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
import { VendorService } from './vendor.service';
import {
  CreateVendorDtoRequest2,
  CreateVendorDtoResponse,
} from './dto/create-vendor.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllVendorsDto2 } from './dto/get-all-vendors.dto';
import { GetSingleVendorDto2 } from './dto/get-single-vendor.dto';
import { GetAllVendorsOnMapDto } from './dto/get-all-vendors-on-map.dto';
import { UpdateVendorDto2 } from './dto/update-vendor.dto';

@ApiBearerAuth()
@ApiTags('Vendors')
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiOperation({ 
    summary: 'Create new vendor',
    description: `
Creates a new vendor in the system.
    `
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
        message: 'validation error',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token'
      }
    }
  })
  @Post('add')
  async create(@Body() createVendorDto: CreateVendorDtoRequest2) {
    return await asyncHandler(this.vendorService.create(createVendorDto));
  }

  @ApiOperation({ 
    summary: 'Get all vendors',
    description: `
Retrieves a list of all vendors in the system.`
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsDto2,
    description: 'List of vendors retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token'
      }
    }
  })
  @Get('')
  async findAll() {
    return await asyncHandler(this.vendorService.findAll());
  }

  @ApiOperation({ 
    summary: 'Update vendor',
    description: `
Updates an existing vendor's information.`
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The unique identifier of the vendor',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: {
      example: {
        status: false,
        message: 'not found'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: {
      example: {
        status: false,
        message: 'validation error',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token'
      }
    }
  })
  @Patch('update/:vendorID')
  async update(
    @Param('vendorID') vendorID: string,
    @Body() updateVendorDto: UpdateVendorDto2,
  ) {
    return await asyncHandler(
      this.vendorService.update(vendorID, updateVendorDto),
    );
  }

  @ApiOperation({ 
    summary: 'Get vendors on map',
    description: `
Retrieves all vendors with their location data for map display.
    `
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsOnMapDto,
    description: 'List of vendors with location data retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token'
      }
    }
  })
  @Get('onMap')
  async findAllOnMap() {
    return await asyncHandler(this.vendorService.findOnMap());
  }

  @ApiOperation({ 
    summary: 'Delete vendor',
    description: `
Permanently deletes a vendor from the system.`
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The unique identifier of the vendor to delete',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: {
      example: {
        status: false,
        message: 'not found'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token'
      }
    }
  })
  @Delete('delete/:vendorID')
  async remove(@Param('vendorID') vendorID: string) {
    return await asyncHandler(this.vendorService.remove(vendorID));
  }

  @ApiOperation({ 
    summary: 'Get vendor by ID',
    description: `
Retrieves detailed information about a specific vendor. `
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor found successfully',
    type: GetSingleVendorDto2
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The unique identifier of the vendor',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: {
      example: {
        status: false,
        message: 'not found'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
    schema: {
      example: {
        status: false,
        message: 'invalid token'
      }
    }
  })
  @Get('/:vendorID')
  async findOne(@Param('vendorID') vendorID: string) {
    return await asyncHandler(this.vendorService.findOne(vendorID));
  }
}
