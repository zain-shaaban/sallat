import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  @IsNumber()
  @IsNotEmpty()
  lng: number;
}
export class CreateVendorDtoRequest {

  @ApiProperty({ example: '0999888777' })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ example: 'example example' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ type: location })
  @IsOptional()
  location: location;

  @ApiProperty({ type: 'boolean', example: false })
  @IsOptional()
  @IsBoolean()
  partner: boolean;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ type: 'string', example: 'example123' })
  @IsOptional()
  @IsString()
  password: string;
}

class CreateVendorData {
  @ApiProperty({ example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f' })
  vendorID: string;
}

export class CreateVendorDtoResponse {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CreateVendorData })
  data: CreateVendorData;
}
