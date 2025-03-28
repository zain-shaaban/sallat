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
import { CustomerService } from './customer.service';
import {
  CreateCustomerDtoRequest,
  CreateCustomerDtoResponse,
} from './dto/create-customer.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllCustomersDto } from './dto/get-all-customers.dto';
import { GetSingleCustomerDto } from './dto/get-single-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetAllCustomersOnMapDto } from './dto/get-all-customers-on-map.dto';

@ApiBearerAuth()
@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateCustomerDtoResponse,
    description: 'The customer has been successfully added',
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
  async create(@Body() createCustomerDto: CreateCustomerDtoRequest) {
    return await asyncHandler(this.customerService.create(createCustomerDto));
  }

  @ApiOperation({ summary: 'Get all customers and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCustomersDto,
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
    return await asyncHandler(this.customerService.findAll());
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'customerID',
    description: 'The ID of the customer',
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
  @ApiOperation({ summary: 'Update single customer data' })
  @Patch('update/:customerID')
  async update(
    @Param('customerID') customerID: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await asyncHandler(
      this.customerService.update(customerID, updateCustomerDto),
    );
  }

  @ApiOperation({ summary: 'Get all customers on map' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCustomersOnMapDto,
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
    return await asyncHandler(this.customerService.findOnMap());
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'customerID',
    description: 'The ID of the customer',
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
  @ApiOperation({ summary: 'Delete single customer' })
  @Delete('delete/:customerID')
  async remove(@Param('customerID') customerID: string) {
    return await asyncHandler(this.customerService.remove(customerID));
  }

  @ApiOperation({ summary: 'Get a single customer by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Driver found successfully',
    type: GetSingleCustomerDto,
  })
  @ApiParam({
    name: 'customerID',
    description: 'The ID of the customer',
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
  @Get('/:customerID')
  async findOne(@Param('customerID') customerID: string) {
    return await asyncHandler(this.customerService.findOne(customerID));
  }
}
