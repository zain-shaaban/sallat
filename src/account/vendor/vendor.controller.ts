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
import { VendorService } from './vendor.service';
import {
  CreateVendorDtoRequest,
  CreateVendorDtoResponse,
} from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllVendorsDto } from './dto/get-all-vendors.dto';
import { GetSingleVendorDto } from './dto/get-single-vendor.dto';

@ApiBearerAuth()
@ApiTags('Account - Vendor')
@Controller('account/vendor')
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
  @Post('create')
  async create(@Body() createVendorDto: CreateVendorDtoRequest) {
    return await asyncHandler(this.vendorService.create(createVendorDto));
  }

  @ApiOperation({ summary: 'Get all vendor and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllVendorsDto,
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
  @Get('getAll')
  async findAll() {
    return await asyncHandler(this.vendorService.findAll());
  }

  @ApiOperation({ summary: 'Get a single Vendor by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor found suvendoressfully',
    type: GetSingleVendorDto,
  })
  @ApiParam({
    name: 'vendorID',
    description: 'The ID of the vendor',
    type: Number,
    example: 20,
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
  @Get('get/:vendorID')
  async findOne(@Param('vendorID', ParseIntPipe) vendorID: number) {
    return await asyncHandler(this.vendorService.findOne(vendorID));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor updated suvendoressfully',
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
    description: 'The ID of the Vendor',
    type: Number,
    example: 20,
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
  @ApiOperation({ summary: 'Update single Vendor data' })
  @Patch('update/:vendorID')
  async update(
    @Param('vendorID', ParseIntPipe) vendorID: number,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return await asyncHandler(
      this.vendorService.update(vendorID, updateVendorDto),
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor deleted suvendoressfully',
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
    description: 'The ID of the Vendor',
    type: Number,
    example: 20,
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
  @ApiOperation({ summary: 'Delete single Vendor' })
  @Delete('delete/:vendorID')
  async remove(@Param('vendorID', ParseIntPipe) vendorID: number) {
    return await asyncHandler(this.vendorService.remove(vendorID));
  }
}
