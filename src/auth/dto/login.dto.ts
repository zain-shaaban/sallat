import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginRequestDto {
  @ApiProperty({
    type: 'string',
    example: 'example@gmail.com',
    description: 'Email address of the user',
    required: true,
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(200, { message: 'Email must not exceed 200 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

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
