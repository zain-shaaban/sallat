import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

export class CreateTripDto {
  @ApiProperty({ type: 'number', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  @Max(1000000)
  driverID: number;

  @ApiProperty({ type: 'number', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Max(1000000)
  vendorID?: number;

  @ApiProperty({ type: 'number', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Max(1000000)
  customerID: number;

  @ApiProperty({ type: 'string', example: 'example example' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  vendorName: string;

  @ApiProperty({ type: 'string', example: '+96399887766' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendorPhoneNumber: string;

  @ApiProperty({ type: location })
  @IsOptional()
  @ValidateNested()
  @Type(() => location)
  vendorLocation: location;

  @ApiProperty({ type: 'string', example: 'example example' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  customerName: string;

  @ApiProperty({ type: 'string', example: '+96399887766' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerPhoneNumber: string;

  @ApiProperty({ type: location })
  @IsOptional()
  @ValidateNested()
  @Type(() => location)
  customerLocation: location;

  @ApiProperty({ type: 'array', example: ['شاورما', 'بطاطا مقلية كاسة'] })
  @IsArray()
  @IsString({ each: true })
  itemTypes: string[];

  @ApiProperty({
    type: 'string',
    example: 'الشاورما بدون خل والبطاطا عبيلي ياها كريم توم',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'number', example: 5200 })
  @IsNumber()
  approxDistance: number;

  @ApiProperty({ type: 'number', example: 80000 })
  @IsNumber()
  approxPrice: number;
}