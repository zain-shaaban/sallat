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
  customerID?: number;

  @ApiProperty({ type: 'string', example: 'example example' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  vendorName?: string;

  @ApiProperty({ type: 'string', example: '+96399887766' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendorPhoneNumber?: string;

  @ApiProperty({ type: location })
  @IsOptional()
  vendorLocation?: location;

  @ApiProperty({ type: 'string', example: 'example example' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  customerName?: string;

  @ApiProperty({ type: 'string', example: '+96399887766' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerPhoneNumber?: string;

  @ApiProperty({ type: location })
  @IsOptional()
  customerLocation?: location;

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
  @IsOptional()
  approxDistance?: number;

  @ApiProperty({ type: 'number', example: 80000 })
  @IsOptional()
  @IsNumber()
  approxPrice?: number;

  @ApiProperty({type:'array',example:[
    { lng: 111.111, lat: 112.222 },
    { lng: 888.888, lat: 999.999 },
    { lng: 555.555, lat: 333.333 },
  ]})
  @IsArray()
  @IsOptional()
  routedPath?:object[]

  @ApiProperty({type:"number",example:133266423})
  @IsOptional()
  @IsNumber()
  approxTime?:number

  @ApiProperty({type:"boolean",example:false})
  @IsOptional()
  @IsBoolean()
  alternative?:boolean
}
