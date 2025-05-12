import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';

class GetVendorsOnMapData {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  vendorID: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  name: string;

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
  location: LocationDto;
}

export class GetAllVendorsOnMapDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetVendorsOnMapData, isArray: true })
  data: GetVendorsOnMapData[];
}
