import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VendorLoginRequestDto {
  @ApiProperty({
    type: 'string',
    example: '0933322211',
    description: 'Phone Number of the vendor',
    required: true,
  })
  @IsString({ message: 'Phone Number must be a string' })
  @IsNotEmpty({ message: 'Phone Number is required' })
  @MinLength(10, { message: 'Phone Number must me 10 characters' })
  @MaxLength(10, { message: 'Phone Number must me 10 characters' })
  phoneNumber: string;

  @ApiProperty({
    type: 'string',
    example: 'example123',
    description: 'User password',
    required: true,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    type: 'boolean',
    example: true,
    description: 'Indicates whether the authentication was successful',
  })
  status: boolean;

  @ApiProperty({
    description: 'Contains the authentication token data',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzQyNzMwNTAsImV4cCI6MTczNjg2NTA1MH0.xXha1z9X0S_Y2YwV-hxSc4Ho8hqPeSupXDumhgwwd5U',
    },
  })
  data: {
    accessToken: string;
  };
}
