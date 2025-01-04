import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CustomerSearchDtoRequest {
  @ApiProperty({ type: 'string', example: '+96399887766' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phoneNumber: string;
}

class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

export class CustomerSearchDtoResponse {
  @ApiProperty({ type: location })
  customerLocation: location;

  @ApiProperty({ type: 'number', example: 50 })
  customerID: number;

  @ApiProperty({ type: 'string', example: 'example example' })
  customerName: string;
}