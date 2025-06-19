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
  Req,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  CreateAccountDtoRequest,
  CreateAccountDtoResponse,
} from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllAccountsDto } from './dto/get-all-accounts.dto';
import { GetSingleAccountDto } from './dto/get-single-account.dto';
import { GetAllDriversDto } from './dto/get-all-drivers.dto';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from './enums/account-role.enum';
import { UpdateNotificationTokenDto } from './dto/update-notification-token.dto';

@ApiBearerAuth('JWT-auth')
@ApiTags('Accounts')
@UseGuards(AccountAuthGuard, RolesGuard)
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
  @Roles(AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Post('create')
  async create(@Body() createAccountDto: CreateAccountDtoRequest) {
    return await this.accountService.create(createAccountDto);
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
  @Roles(AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('find')
  async findAll() {
    return await this.accountService.findAll();
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
  @Roles(AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return await this.accountService.findOne(id);
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
  @Roles(AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('findbyrole/:role')
  async findByRole(@Param('role') role: string) {
    return await this.accountService.findByRole(role);
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
  @Roles(AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await this.accountService.update(id, updateAccountDto);
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
  @Roles(AccountRole.SUPERADMIN)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.accountService.remove(id);
  }

  @ApiOperation({
    summary: 'Get all drivers',
    description: `
Retrieves a list of all drivers in the system`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllDriversDto,
    description: 'List of drivers retrieved successfully',
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
  @Get('driverData')
  async findDriversData() {
    return await this.accountService.findDrivers();
  }

  @ApiOperation({
    summary: 'Update driver notification token',
    description: `
Updates an existing driver's notification token.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification Token updated successfully',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
    schema: {
      example: {
        status: false,
        message:
          'Driver with ID 440cbc27-e325-499a-9468-295aad93c378 not found',
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
  @Roles(AccountRole.DRIVER)
  @Patch('notificationToken')
  async updateNotificationToken(
    @Req() req,
    @Body() updateNotificationToken: UpdateNotificationTokenDto,
  ) {
    return await this.accountService.updateNotificationToken(
      req.user.id,
      updateNotificationToken.notificationToken,
    );
  }
}
