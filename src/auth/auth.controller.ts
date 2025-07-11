import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { VendorLoginRequestDto } from './dto/vendor-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User authentication',
    description: `
Authenticates a user and returns a JWT token for subsequent API requests.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDto,
    description: 'Authentication successful - Returns JWT token',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed - Invalid credentials',
    schema: {
      example: {
        status: false,
        message: 'Wrong credentials',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(@Body() loginDto: LoginRequestDto) {
    return await this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Vendor authentication',
    description: `
Authenticates a vendor and returns a JWT token for subsequent API requests.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDto,
    description: 'Authentication successful - Returns JWT token',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed - Invalid credentials',
    schema: {
      example: {
        status: false,
        message: 'Wrong credentials',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Post('vendorLogin')
  async vendorLogin(@Body() loginDto: VendorLoginRequestDto) {
    return await this.authService.vendorLogin(loginDto);
  }

  @ApiOperation({
    summary: 'User Logout',
    description: `
Logging out from outside the system.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    example: {
      status: true,
      data: null,
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
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AccountAuthGuard)
  @Get('logout')
  async logout(@Req() req) {
    return await this.authService.logout(req.user.name);
  }
}
