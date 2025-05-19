import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

export class GetCustomerData {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier of the customer',
  })
  customerID: string;

  @ApiProperty({
    type: [String],
    example: ['+96399887766', '+96399988877'],
    description: 'Array of phone numbers associated with the customer',
  })
  phoneNumbers: string[];

  @ApiProperty({
    type: 'string',
    example: 'John Doe',
    description: 'Full name of the customer',
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

export class GetAllCustomersDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  status: boolean;

  @ApiProperty({
    type: GetCustomerData,
    isArray: true,
    description: 'Array of customer data',
  })
  data: GetCustomerData[];
}
