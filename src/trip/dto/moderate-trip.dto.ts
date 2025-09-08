import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class ModerateTripDto {
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
    example: 'الشاورما بدون خل والبطاطا عبيلي ياها كريم توم',
    description: 'Additional notes or special instructions for the delivery',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

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
  driverID?: string;

  @ApiProperty({
    example: true,
    description: 'To determine if the trip is a partner or not.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  partner?: boolean;

  @ApiProperty({
    example: 20000,
    description: 'Price of items',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  itemPrice?: number;

  @ApiProperty({
    type: 'number',
    example: 80000,
    description: 'Price of the trip in the local currency',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

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
}
