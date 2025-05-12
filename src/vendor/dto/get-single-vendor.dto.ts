import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';

class SingleVendorData {
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
    type: 'string',
    example: '+962798765432',
    description: "Vendor's contact phone number in international format",
  })
  phoneNumber: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Geographic location of the vendor',
    example: {
      coords: {
        lat: 31.9539,
        lng: 35.9106,
      },
      approximate: false,
      description: 'Downtown Amman',
    },
  })
  location: LocationDto;
}

export class GetSingleVendorDto {
  @ApiProperty({
    example: true,
    description: 'Operation status indicating success or failure',
  })
  status: boolean;

  @ApiProperty({
    type: SingleVendorData,
    description: 'Detailed vendor data including associated trips',
    example: {
      vendorID: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
      name: 'Restaurant Name',
      phoneNumber: '+962798765432',
      location: {
        coords: {
          lat: 31.9539,
          lng: 35.9106,
        },
        approximate: false,
        description: 'Downtown Amman',
      },
    }
  })
  data: SingleVendorData;
}
