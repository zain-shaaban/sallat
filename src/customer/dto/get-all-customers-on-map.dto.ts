import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

class GetCustomersOnMapData {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier of the customer'
  })
  customerID: string;

  @ApiProperty({ 
    type: 'string', 
    example: 'John Doe',
    description: 'Full name of the customer'
  })
  name: string;

  @ApiProperty({ 
    type: LocationDto,
    description: 'Geographic location of the customer',
    example: {
      coords: {
        lat: 58.16543232,
        lng: 36.18875421
      },
      approximate: true,
      description: 'بجانب المحكمة'
    }
  })
  location: LocationDto;
}

export class GetAllCustomersOnMapDto {
  @ApiProperty({ 
    example: true,
    description: 'Indicates if the operation was successful'
  })
  status: boolean;

  @ApiProperty({ 
    type: GetCustomersOnMapData, 
    isArray: true,
    description: 'Array of customers with location data for map display'
  })
  data: GetCustomersOnMapData[];
}
