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
@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({
    summary: 'Create new customer',
    description: 'Creates a new customer',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateCustomerDtoResponse,
    description: 'The customer has been successfully created',
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
        message: 'invalid token',
      },
    },
  })
  @Post('add')
  async create(@Body() createCustomerDto: CreateCustomerDtoRequest) {
    return await asyncHandler(this.customerService.create(createCustomerDto));
  }

  @ApiOperation({
    summary: 'Get all customers',
    description:
      'Retrieves a list of all customers with their details including trips',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCustomersDto,
    description: 'List of customers retrieved successfully',
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
  @Get('')
  async findAll() {
    return await asyncHandler(this.customerService.findAll());
  }

  @ApiOperation({
    summary: 'Update customer',
    description: "Updates an existing customer's information by their ID",
  })
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
    description: 'The unique identifier of the customer',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found with the provided ID',
    schema: {
      example: {
        status: false,
        message: 'not found',
      },
    },
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
        message: 'invalid token',
      },
    },
  })
  @Patch('update/:customerID')
  async update(
    @Param('customerID') customerID: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await asyncHandler(
      this.customerService.update(customerID, updateCustomerDto),
    );
  }

  @ApiOperation({
    summary: 'Get customers on map',
    description:
      'Retrieves a list of customers with their location data for map display',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCustomersOnMapDto,
    description: 'List of customers with location data retrieved successfully',
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
  @Get('onMap')
  async findAllOnMap() {
    return await asyncHandler(this.customerService.findOnMap());
  }

  @ApiOperation({
    summary: 'Delete customer',
    description: 'Deletes a customer by their ID',
  })
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
    description: 'The unique identifier of the customer to delete',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found with the provided ID',
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
  @Delete('delete/:customerID')
  async remove(@Param('customerID') customerID: string) {
    return await asyncHandler(this.customerService.remove(customerID));
  }

  @ApiOperation({
    summary: 'Get single customer',
    description:
      'Retrieves detailed information about a specific customer by their ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer found successfully',
    type: GetSingleCustomerDto,
  })
  @ApiParam({
    name: 'customerID',
    description: 'The unique identifier of the customer',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found with the provided ID',
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
  @Get('/:customerID')
  async findOne(@Param('customerID') customerID: string) {
    return await asyncHandler(this.customerService.findOne(customerID));
  }
}
