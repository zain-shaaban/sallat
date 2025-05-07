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

@ApiBearerAuth()
@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: 'Create new account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateAccountDtoResponse,
    description: 'The account has been successfully added',
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
  async create(@Body() createAccountDto: CreateAccountDtoRequest) {
    return await asyncHandler(this.accountService.create(createAccountDto));
  }

  @ApiOperation({ summary: 'Get all accounts and their number' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllAccountsDto,
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
  @Get('find')
  async findAll() {
    return await asyncHandler(this.accountService.findAll());
  }

  @ApiOperation({ summary: 'Get a single account by his ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account found successfully',
    type: GetSingleAccountDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the account',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
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
  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return await asyncHandler(this.accountService.findOne(id));
  }

  @ApiOperation({ summary: 'Get all accounts by role' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllAccountsDto,
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
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wrong role',
    schema: {
      example: {
        status: false,
        message: 'role not exist',
      },
    },
  })
  @ApiParam({
    name: 'role',
    description: 'The role of accounts',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @Get('findbyrole/:role')
  async findByRole(@Param('role') role: string) {
    return await asyncHandler(this.accountService.findByRole(role));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the Account',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
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
  @ApiOperation({ summary: 'Update single Account data' })
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await asyncHandler(this.accountService.update(id, updateAccountDto));
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the Account',
    type: String,
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
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
  @ApiOperation({ summary: 'Delete single Account' })
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await asyncHandler(this.accountService.remove(id));
  }
}
