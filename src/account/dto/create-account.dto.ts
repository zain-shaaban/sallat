import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { AccountRole } from '../account.service';

export class CreateAccountDtoRequest {
  @ApiProperty({ example: 'example example' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'example@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'example123',
    description: 'Minimum length is 6 character',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(200)
  password: string;

  @ApiProperty({ example: '0999888777' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phoneNumber: string;

  @ApiProperty({ example: 'driver', required: true })
  @IsNotEmpty()
  @IsEnum(AccountRole, { message: 'Role is wrong' })
  role: string;

  @ApiProperty({ example: 1500000.0, required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ example: 332211, required: false })
  @IsOptional()
  @IsString()
  assignedVehicleNumber?: string;

  @ApiProperty({ example: 'tokentokentoken', required: false })
  @IsOptional()
  @IsString()
  notificationToken?: string;
}

class CreateAccountData {
  @ApiProperty({ example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f' })
  id: string;
}

export class CreateAccountDtoResponse {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CreateAccountData })
  data: CreateAccountData;
}
