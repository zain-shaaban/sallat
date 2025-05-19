import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';

export class CustomerSearchDtoResponse {
  @ApiProperty({
    type: 'number',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  customerID: string;

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
  })
  location: LocationDto;
}
