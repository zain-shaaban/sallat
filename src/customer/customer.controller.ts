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
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  CreateCustomerDtoRequest,
  CreateCustomerDtoResponse,
} from './dto/create-customer.dto';
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
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { MergeTwoCustomersDTO } from './dto/merge-two-customers.dto';

@ApiBearerAuth('JWT-auth')
@ApiTags('Customers')
@UseGuards(AccountAuthGuard, RolesGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Roles(AccountRole.SUPERADMIN,AccountRole.MANAGER)
  @Post('merge')
  async mergeCustomers(@Body() mergeTwoCustomersDTO: MergeTwoCustomersDTO) {
    return this.customerService.mergeCustomers(
      mergeTwoCustomersDTO.originalCustomerID,
      mergeTwoCustomersDTO.fakeCustomerID,
    );
  }

  @ApiOperation({
    summary: 'Create new customer',
    description:
      'Creates a new customer with the provided information including name, phone number, and optional location data.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateCustomerDtoResponse,
    description:
      'The customer has been successfully created. Returns the customer ID.',
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
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Post('add')
  async create(@Body() createCustomerDto: CreateCustomerDtoRequest) {
    return await this.customerService.create(createCustomerDto);
  }

  @ApiOperation({
    summary: 'Get all customers',
    description:
      'Retrieves a list of all customers with their complete details including trips, contact information, and location data.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCustomersDto,
    description:
      'List of customers retrieved successfully. Returns an array of customer objects with their complete details.',
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
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN, AccountRole.CC)
  @Get('')
  async findAll() {
    return await this.customerService.findAll();
  }

  @ApiOperation({
    summary: 'Update customer',
    description:
      "Updates an existing customer's information by their ID. Can update name, phone numbers, and location data.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer updated successfully. Returns a success status.',
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
    description: 'The unique identifier of the customer to update',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Customer not found with the provided ID. The specified customer ID does not exist in the system.',
    schema: {
      example: {
        status: false,
        message:
          'Customer with ID c1a8b798-4f3e-4f3f-a7fd-e77c1ea1fbe5 not found',
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
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Patch('update/:customerID')
  async update(
    @Param('customerID') customerID: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customerService.update(customerID, updateCustomerDto);
  }

  @ApiOperation({
    summary: 'Get customers on map',
    description:
      'Retrieves a list of customers with their location data for map display. Returns only the essential data needed for map visualization.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCustomersOnMapDto,
    description:
      'List of customers with location data retrieved successfully. Returns an array of customer objects with their ID, name, and location coordinates.',
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
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN, AccountRole.CC)
  @Get('onMap')
  async findAllOnMap() {
    return await this.customerService.findOnMap();
  }

  @ApiOperation({
    summary: 'Delete customer',
    description: 'Deletes a customer by their ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer deleted successfully. Returns a success status.',
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
    description:
      'Customer not found with the provided ID. The specified customer ID does not exist in the system.',
    schema: {
      example: {
        status: false,
        message:
          'Customer with ID c1a8b798-4f3e-4f3f-a7fd-e77c1ea1fbe5 not found',
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
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN)
  @Delete('delete/:customerID')
  async remove(@Param('customerID') customerID: string) {
    return await this.customerService.remove(customerID);
  }

  @ApiOperation({
    summary: 'Get single customer',
    description:
      'Retrieves detailed information about a specific customer by their ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Customer found successfully. Returns the complete customer data.',
    type: GetSingleCustomerDto,
  })
  @ApiParam({
    name: 'customerID',
    description: 'The unique identifier of the customer to retrieve',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Customer not found with the provided ID. The specified customer ID does not exist in the system.',
    schema: {
      example: {
        status: false,
        message:
          'Customer with ID c1a8b798-4f3e-4f3f-a7fd-e77c1ea1fbe5 not found',
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
  @Roles(AccountRole.MANAGER, AccountRole.SUPERADMIN, AccountRole.CC)
  @Get(':customerID')
  async findOne(@Param('customerID') customerID: string) {
    return await this.customerService.findOne(customerID);
  }
}
