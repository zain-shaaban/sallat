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
  Matches,
} from 'class-validator';
import { AccountRole } from '../enums/account-role.enum';
import {
  IAccountResponse,
  ICreateAccountRequest,
} from '../interfaces/account.interface';
import { Transform } from 'class-transformer';

export class CreateAccountDtoRequest implements ICreateAccountRequest {
  @ApiProperty({
    example: 'Lucas Davis',
    description: 'Full name of the account holder',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'lucas@gmail.com',
    description: 'Unique email address for the account',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'example123',
    description: 'Account password (min 6 characters)',
    minLength: 6,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(200)
  password: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[^a-zA-Z]+$/, {
    message: 'Phone number is not valid',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'driver',
    description: 'Account role in the system',
    enum: AccountRole,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(AccountRole, { message: 'Invalid role specified' })
  role: AccountRole;

  @ApiProperty({
    example: 1500000.0,
    description: 'Monthly salary',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({
    example: 'ABC123',
    description: 'Vehicle number assigned to driver',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedVehicleNumber?: string;

  @ApiProperty({
    example: 'fcm-token-123',
    description: 'Firebase Cloud Messaging token for notifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  notificationToken?: string;

  @ApiProperty({
    example: 'A041',
    description: 'code name of the driver',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;
}

export class CreateAccountDtoResponse implements IAccountResponse {
  @ApiProperty({
    example: true,
    description: 'Operation status',
  })
  status: boolean;

  @ApiProperty({
    example: {
      id: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    },
    description: 'Created account id',
  })
  data: {
    id: string;
  };
}
