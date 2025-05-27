import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @ApiProperty({ 
    type: 'number', 
    example: 58.16543232, 
    description: 'Latitude coordinate',
    minimum: -90,
    maximum: 90
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lat: number;

  @ApiProperty({ 
    type: 'number', 
    example: 36.18875421, 
    description: 'Longitude coordinate',
    minimum: -180,
    maximum: 180
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lng: number;
}

export class LocationDto {
  @ApiProperty({ 
    type: CoordinatesDto,
    description: 'Geographic coordinates of the location',
    example: {
      lat: 58.16543232,
      lng: 36.18875421
    }
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  coords: CoordinatesDto;

  @ApiProperty({ 
    type: 'boolean',
    example: true,
    description: 'Indicates if the location is approximate'
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  approximate?: boolean;

  @ApiProperty({ 
    type: 'string',
    example: 'بجانب المحكمة',
    description: 'Description or address of the location',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
} 