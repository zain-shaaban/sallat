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
import { AccountService } from './account.service';
import {
  CreateAccountDtoRequest,
  CreateAccountDtoResponse,
} from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { asyncHandler } from 'src/common/utils/async-handler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllAccountsDto } from './dto/get-all-accounts.dto';
import { GetSingleAccountDto } from './dto/get-single-account.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiBearerAuth('JWT-auth')
@ApiTags('Accounts')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({
    summary: 'Create new account',
    description: `
Creates a new user account in the system.

### Account Types
- Super Admin: Full system access and can manage all system settings and users
- Manager: Can manage orders, drivers and call center staff
- Call Center: Handles customer support and order management through the web system
- Driver: Delivers orders and updates delivery status through mobile app

### Security
- Password is automatically hashed
- Email must be unique
- Phone number must be unique
- Role-based access control enforced

### Validation
- Email format validation
- Password strength requirements
- Phone number format validation
- Required fields validation
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateAccountDtoResponse,
    description: 'The account has been successfully created',
    schema: {
      example: {
        status: true,
        data: {
          id: '3c559f4a-ef14-4e62-8874-384a89c8689e',
        },
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
    status: HttpStatus.CONFLICT,
    description: 'Email or phone number already exists',
    schema: {
      example: {
        status: false,
        message: 'Email already exists',
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
  @Post('create')
  async create(@Body() createAccountDto: CreateAccountDtoRequest) {
    return await asyncHandler(this.accountService.create(createAccountDto));
  }

  @ApiOperation({
    summary: 'Get all accounts',
    description: `
Retrieves a list of all accounts in the system`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllAccountsDto,
    description: 'List of accounts retrieved successfully',
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
  @Get('find')
  @UseGuards(ThrottlerGuard)
  async findAll() {
    return await asyncHandler(this.accountService.findAll());
  }

  @ApiOperation({
    summary: 'Get account by ID',
    description: `
Retrieves detailed information about a specific account.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account found successfully',
    type: GetSingleAccountDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the account',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
    schema: {
      example: {
        status: false,
        message:
          'Account with ID 78f45450-9532-452d-b606-ed67778bde0b not found',
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
  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return await asyncHandler(this.accountService.findOne(id));
  }

  @ApiOperation({
    summary: 'Get accounts by role',
    description: `
Retrieves all accounts with a specific role.

### Available Roles
- Super Admin
- Manager
- Call Center
- Driver
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllAccountsDto,
    description: 'Accounts retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid role specified',
    schema: {
      example: {
        status: false,
        message: 'Invalid role: customer',
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
    name: 'role',
    description: 'The role to filter accounts by',
    type: String,
    example: 'driver',
    enum: ['superadmin', 'manager', 'cc', 'driver'],
  })
  @Get('findbyrole/:role')
  async findByRole(@Param('role') role: string) {
    return await asyncHandler(this.accountService.findByRole(role));
  }

  @ApiOperation({
    summary: 'Update account',
    description: `
Updates an existing account's information.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the account to update',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
    schema: {
      example: {
        status: false,
        message:
          'Account with ID 440cbc27-e325-499a-9468-295aad93c378 not found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data',
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
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await asyncHandler(this.accountService.update(id, updateAccountDto));
  }

  @ApiOperation({
    summary: 'Delete account',
    description: `
Permanently deletes an account from the system.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account deleted successfully',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the account to delete',
    type: String,
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
    schema: {
      example: {
        status: false,
        message:
          'Account with ID 440cbc27-e325-499a-9468-295aad93c378 not found',
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
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await asyncHandler(this.accountService.remove(id));
  }
}
