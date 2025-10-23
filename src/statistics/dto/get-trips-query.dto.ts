import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GetTripsQueryDTO {
  @ApiProperty({
    description: 'The CC ID to filter trips',
    example: 'cc12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ccID?: string;

  @ApiProperty({
    description: 'The start date to filter trips',
    example: '2023-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdAtStart?: string;

  @ApiProperty({
    description: 'The end date to filter trips',
    example: '2023-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdAtEnd?: string;

  @ApiProperty({
    description: 'The vendor ID to filter trips',
    example: 'vendor123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendorID?: string;

  @ApiProperty({
    description: 'The customer ID to filter trips',
    example: 'customer123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerID?: string;

  @ApiProperty({
    description: 'The driver ID to filter trips',
    example: 'driver123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  driverID?: string;

  @ApiProperty({
    description: 'Filter for alternative trips',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  alternative: boolean;

  @ApiProperty({
    description: 'Filter for partner trips',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  partner: boolean;

  @ApiProperty({
    description: 'Filter for trips with SMS sent',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  isSMSSend: boolean;

  @ApiProperty({
    description: 'The vehicle number to filter trips',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vehicleNumber: string;

  @ApiProperty({
    description: 'The item types to filter trips',
    example: ['شاورما', 'بطاطا مقلية'],
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  itemTypes: string[];

  @ApiProperty({
    description: 'The starting price to filter trips',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  priceStart: number;

  @ApiProperty({
    description: 'The ending price to filter trips',
    example: 500,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  priceEnd: number;

  @ApiProperty({
    description: 'Filter for trips with discounts',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  discounts: boolean;

  @ApiProperty({
    description: 'Filter for trips with fixed price',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  fixedPrice: boolean;

  @ApiProperty({
    description: 'Filter for trips with scheduling date',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  schedulingDate: boolean;

  @ApiProperty({
    description: 'The start time to filter trips',
    example: 1622505600000,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  timeStart: number;

  @ApiProperty({
    description: 'The end time to filter trips',
    example: 1625097600000,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  timeEnd: number;

  @ApiProperty({
    description: 'Filter for trips with notes',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  note: boolean;

  @ApiProperty({
    description: 'The status of the trip',
    example: 'completed',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  status: string;

  @ApiProperty({
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page: number = 1;

  @ApiProperty({
    description: 'The limit of the trips per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  limit: number = 20;

  @ApiProperty({
    description: 'The sort by field',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy: string = 'createdAt';

  @ApiProperty({
    description: 'The order of the trips',
    example: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  order: string = 'DESC';
}
