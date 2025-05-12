import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { LocationDto } from 'src/customer/dto/location.dto';

export class CreateTripDto {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description:
      'ID of the driver assigned to this trip. If not provided, the trip will be pending assignment.',
    required: false,
  })
  @IsString()
  @IsOptional()
  driverID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description:
      'ID of the vendor for this trip. Required for regular trips, optional for alternative trips.',
    required: false,
  })
  @IsOptional()
  @IsString()
  vendorID?: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'ID of the customer for this trip',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerID?: string;

  @ApiProperty({
    type: 'string',
    example: 'example example',
    description: 'Name of the vendor. Required for new vendors.',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  vendorName?: string;

  @ApiProperty({
    type: 'string',
    example: '+96399887766',
    description: 'Phone number of the vendor. Required for new vendors.',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendorPhoneNumber?: string;

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
    },
    required: false,
  })
  @IsOptional()
  vendorLocation?: LocationDto;

  @ApiProperty({
    type: 'string',
    example: 'example example',
    description: 'Name of the customer',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  customerName?: string;

  @ApiProperty({
    type: 'string',
    example: '+96399887766',
    description: 'Primary phone number of the customer',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerPhoneNumber?: string;

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
    },
    required: false,
  })
  @IsOptional()
  customerLocation?: LocationDto;

  @ApiProperty({
    type: 'array',
    example: ['شاورما', 'بطاطا مقلية كاسة'],
    description: 'List of items to be delivered in this trip',
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsString({ each: true })
  itemTypes: string[];

  @ApiProperty({
    type: 'string',
    example: 'الشاورما بدون خل والبطاطا عبيلي ياها كريم توم',
    description: 'Additional notes or special instructions for the delivery',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'number',
    example: 5200,
    description: 'Approximate distance of the trip in meters',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  approxDistance?: number;

  @ApiProperty({
    type: 'number',
    example: 80000,
    description: 'Approximate price of the trip in the local currency',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  approxPrice?: number;

  @ApiProperty({
    type: 'array',
    example: [
      { lng: 111.111, lat: 112.222 },
      { lng: 888.888, lat: 999.999 },
      { lng: 555.555, lat: 333.333 },
    ],
    description:
      'Array of coordinates representing the planned route for the trip',
    required: false,
    items: {
      type: 'object',
      properties: {
        lng: { type: 'number' },
        lat: { type: 'number' },
      },
    },
  })
  @IsArray()
  @IsOptional()
  routedPath?: object[];

  @ApiProperty({
    type: 'number',
    example: 133266423,
    description: 'Approximate time for the trip in milliseconds',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  approxTime?: number;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description:
      'Indicates if this is an alternative trip (true) or a regular trip (false)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  alternative?: boolean;

  @ApiProperty({
    type: 'array',
    example: ['+96399988877', '+96398877766'],
    description: 'Additional phone numbers for the customer',
    required: false,
    items: {
      type: 'string',
    },
  })
  @IsOptional()
  @IsArray()
  customerAlternativePhoneNumbers: string[];
}
