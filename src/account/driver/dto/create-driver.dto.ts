import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDriverDtoRequest {
  @ApiProperty({ example: 'example example' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'example@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(200)
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

  @ApiProperty({ example: 332211, required: false })
  @IsOptional()
  @IsString()
  assignedVehicleNumber?: string;

  @ApiProperty({ example: 1500000.0, required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ example: 'tokentokentoken', required: false })
  @IsOptional()
  @IsString()
  notificationToken?: string;
}

class CreateDriverData {
  @ApiProperty({ example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f' })
  driverID: string;
}

export class CreateDriverDtoResponse {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CreateDriverData })
  data: CreateDriverData;
}
