import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';

class VendorOnMapData {
  @ApiProperty({
    type: 'string',
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
    description: 'Unique identifier for the vendor',
  })
  vendorID: string;

  @ApiProperty({
    type: 'string',
    example: 'Restaurant Name',
    description: 'Name of the vendor business',
  })
  name: string;

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
    required: false,
  })
  location: LocationDto;
}

export class GetAllVendorsOnMapDto {
  @ApiProperty({
    example: true,
    description: 'Operation status indicating success or failure',
  })
  status: boolean;

  @ApiProperty({
    type: [VendorOnMapData],
    description: 'Array of vendor data optimized for map display',
    example: [
      {
        vendorID: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
        name: 'حلويات لطش',
        location: {
          coords: {
            lat: 31.9539,
            lng: 35.9106,
          },
          approximate: false,
          description: 'قرب دوار امية',
        },
      },
    ],
  })
  data: VendorOnMapData[];
}
