import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LocationDto } from 'src/customer/dto/location.dto';

export class CreateVendorDtoRequest {
  @ApiProperty({ example: 'example example' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phoneNumber: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Geographic location of the customer',
    example: {
      coords: {
        lat: 58.16543232,
        lng: 36.18875421,
      },
      approximate: true,
      description: 'بجانب المحكمة',
    },
    required: false,
  })
  @IsOptional()
  location: LocationDto;
}

class CreateVendorData {
  @ApiProperty({ example: '83e9c864-b8be-49ce-bb37-2c91ff963928' })
  vendorID: string;
}

export class CreateVendorDtoResponse {
  @ApiProperty({
    example: true,
    description: 'Operation status',
  })
  status: boolean;

  @ApiProperty({
    example: {
      id: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    },
    description: 'Created vendor id',
  })
  data: {
    vendorID: string;
  };
}
