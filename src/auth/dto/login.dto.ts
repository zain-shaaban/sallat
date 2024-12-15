import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @ApiProperty({ type: 'string', example: 'example123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

class LoginData {
  @ApiProperty({
    type: 'string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzQyNzMwNTAsImV4cCI6MTczNjg2NTA1MH0.xXha1z9X0S_Y2YwV-hxSc4Ho8hqPeSupXDumhgwwd5U',
  })
  accessToken: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: 'boolean', example: true })
  status: boolean;

  @ApiProperty({ type: LoginData })
  data: LoginData;
}
