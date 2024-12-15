import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { asyncHandler } from 'src/common/utils/async-handler';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
    schema: {
      example: {
        status: false,
        message: 'Wrong credentials',
      },
    },
  })
  @ApiParam({
    name: 'type',
    enum: ['driver', 'manager', 'vendor', 'cc'],
  })
  @HttpCode(HttpStatus.OK)
  @Post(':type/login')
  async login(@Body() loginDto: LoginRequestDto, @Param('type') type: string) {
    return await asyncHandler(this.authService.login(loginDto, type));
  }
}
