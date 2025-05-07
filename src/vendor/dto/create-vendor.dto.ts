import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
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

export class CreateVendorDtoRequest2 {
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
  @ApiProperty({ example: '83e9c864-b8be-49ce-bb37-2c91ff963928' })
  vendorID: string;
}

export class CreateVendorDtoResponse {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CreateVendorData })
  data: CreateVendorData;
}
