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
@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiOperation({ summary: 'Create new vendor' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateVendorDtoResponse,
    description: 'The vendor has been successfully added',
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
  @Post('add')
  async create(@Body() createVendorDto: CreateVendorDtoRequest2) {
    return await asyncHandler(this.vendorService.create(createVendorDto));
  }

  @ApiOperation({ summary: 'Get all vendors and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsDto2,
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
    return await asyncHandler(this.vendorService.findAll());
  }

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
    description: 'The ID of the vendor',
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
  @ApiOperation({ summary: 'Update single vendor data' })
  @Patch('update/:vendorID')
  async update(
    @Param('vendorID') vendorID: string,
    @Body() updateVendorDto: UpdateVendorDto2,
  ) {
    return await asyncHandler(
      this.vendorService.update(vendorID, updateVendorDto),
    );
  }

  @ApiOperation({ summary: 'Get all vendors on map' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsOnMapDto,
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
  @Get('onMap')
  async findAllOnMap() {
    return await asyncHandler(this.vendorService.findOnMap());
  }

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
    description: 'The ID of the vendor',
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
  @ApiOperation({ summary: 'Delete single vendor' })
  @Delete('delete/:vendorID')
  async remove(@Param('vendorID') vendorID: string) {
    return await asyncHandler(this.vendorService.remove(vendorID));
  }

  @ApiOperation({ summary: 'Get a single vendor by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Driver found successfully',
    type: GetSingleVendorDto2,
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The ID of the vendor',
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
  @Get('/:vendorID')
  async findOne(@Param('vendorID') vendorID: string) {
    return await asyncHandler(this.vendorService.findOne(vendorID));
  }
}
