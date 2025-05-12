import { ApiProperty } from '@nestjs/swagger';
import { Trip } from 'src/trip/entities/trip.entity';
class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

export class GetVendorData {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  vendorID: string;

  @ApiProperty({ example: '0999888777' })
  phoneNumber: string;

  @ApiProperty({ example: 'example example' })
  name: string;

  @ApiProperty({ type: location })
  location: location;

  @ApiProperty({ type: Trip, isArray: true })
  trips: Trip[];
}

export class GetAllVendorsDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetVendorData, isArray: true })
  data: GetVendorData[];
}
