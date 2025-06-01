import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { CoordinatesDto } from 'src/customer/dto/location.dto';

class LocationWithAccuracy {
  @IsNumber()
  time: number;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  coords: CoordinatesDto;

  @IsNumber()
  accuracy: number;
}

export class CreateSessionDto {
  @ApiProperty({
    example: 1748281061291,
    description: 'Start date of session by milli second',
    type: 'number',
  })
  @IsNumber()
  startDate: number;

  @ApiProperty({
    example: '#277DA1',
    description: 'Raw color',
    type: 'string',
  })
  @IsString()
  color: string;

  @ApiProperty({
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier of the driver',
  })
  @IsString()
  driverID: string;

  @ApiProperty({
    example: 'ABC123',
    description: 'Vehicle number assigned to driver',
    required: false,
  })
  @IsString()
  vehicleNumber: string;

  @ApiProperty({
    example: [
      {
        time: 1748281061291,
        coords: {
          lat: 34.8851565,
          lng: 35.8805156,
        },
        accuracy: 4.274,
      },
      {
        time: 1748281069996,
        coords: {
          lat: 34.8848103,
          lng: 35.8807436,
        },
        accuracy: 3.316,
      },
    ],
    description: 'locations array of the path',
    type: [Object],
  })
  @IsArray()
  locations: LocationWithAccuracy[];

  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNumber()
  number: number;
}
