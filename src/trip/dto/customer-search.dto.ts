import { ApiProperty } from '@nestjs/swagger';

class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

export class CustomerSearchDtoResponse {
  @ApiProperty({ type: location })
  location: location;

  @ApiProperty({ type: 'number', example: '3c559f4a-ef14-4e62-8874-384a89c8689e' })
  customerID: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  name: string;
}