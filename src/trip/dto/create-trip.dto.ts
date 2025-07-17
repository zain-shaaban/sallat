import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CoordinatesDto, LocationDto } from 'src/customer/dto/location.dto';
import { Type } from 'class-transformer';

class Discounts {
  @ApiProperty({
    type: 'number',
    description: 'discounts from items',
    example: 0.2,
  })
  @IsNumber()
  @IsNotEmpty()
  item: number;

  @ApiProperty({
    type: 'number',
    description: 'discounts from delivery',
    example: 0.4,
  })
  @IsNumber()
  @IsNotEmpty()
  delivery: number;
}

export class CreateTripDto {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description:
      'ID of the driver assigned to this trip. If not provided, the trip will be pending assignment.',
    required: false,
  })
  @IsString()
  @IsUUID()
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
  @IsUUID()
  vendorID?: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'ID of the customer for this trip',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUUID()
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
    description: 'Geographic location of the vendor',
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
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
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
  @IsString()
  @MaxLength(100)
  customerPhoneNumber?: string;

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
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  customerLocation?: LocationDto;

  @ApiProperty({
    example: true,
    description: 'To determine if the trip is a partner or not.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  partner: boolean;

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
  @IsNotEmpty()
  itemTypes: string[];

  @ApiProperty({
    type: 'string',
    example: 'الشاورما بدون خل والبطاطا عبيلي ياها كريم توم',
    description: 'Additional notes or special instructions for the delivery',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    type: 'number',
    example: 5200,
    description: 'Approximate distance of the trip in meters',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  approxDistance?: number;

  @ApiProperty({
    type: 'number',
    example: 80000,
    description: 'Approximate price of the trip in the local currency',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approxPrice?: number;

  @ApiProperty({
    type: 'number',
    example: 9000,
    description: 'Fixed price of the trip in the local currency',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  fixedPrice?: number;

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
  @ValidateNested({ each: true })
  @Type(() => CoordinatesDto)
  routedPath?: CoordinatesDto[];

  @ApiProperty({
    type: 'number',
    example: 133266423,
    description: 'Approximate time for the trip in milliseconds',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
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
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  customerAlternativePhoneNumbers: string[];

  @ApiProperty({
    type: Discounts,
    description: 'Discounts from the price',
    example: {
      item: 0.2,
      delivery: 0.4,
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Discounts)
  discounts?: Discounts;

  @ApiProperty({
    type: 'number',
    example: Date.now(),
    description: 'Scheduling date to the trip',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  schedulingDate: number;

  @ApiProperty({
    type: 'string',
    example: 'العميل لم يرد على الاتصال',
    description: 'note about problem or something else in the trip',
    required: false,
  })
  @IsString()
  @IsOptional()
  note: string;
}
