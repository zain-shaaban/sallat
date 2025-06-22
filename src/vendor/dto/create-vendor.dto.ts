import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
  Matches,
  IsOptional,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from 'src/customer/dto/location.dto';

export class CreateVendorDtoRequest {
  @ApiProperty({
    example: 'Restaurant Name',
    description: 'Name of the vendor business',
    maxLength: 200,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: '+962798765432',
    description: "Vendor's contact phone number in international format",
    maxLength: 20,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^a-zA-Z]+$/, {
    message: 'Phone number is not valid',
  })
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({
    example: 'example',
    description: "Vendor's password",
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(4)
  password: string;

  @ApiProperty({
    example: true,
    description: 'To determine if the vendor is a partner or not.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  partner: boolean;

  @ApiProperty({
    type: LocationDto,
    description: 'Geographic location of the vendor',
    example: {
      coords: {
        lat: 31.9539,
        lng: 35.9106,
      },
      approximate: true,
      description: 'بجانب المحكمة',
    },
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}

export class CreateVendorDtoResponse {
  @ApiProperty({
    example: true,
    description: 'Operation status indicating success or failure',
  })
  status: boolean;

  @ApiProperty({
    description: "Data containing the created vendor's ID",
    example: {
      vendorID: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    },
  })
  data: {
    vendorID: string;
  };
}
