import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CoordinatesDto } from 'src/customer/dto/location.dto';

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

export class sendLocationDto {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @IsString()
  @IsNotEmpty()
  driverID: string;

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Geographic coordinates of the location',
    example: {
      lat: 58.16543232,
      lng: 36.18875421,
    },
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  location: CoordinatesDto;

  @ApiProperty({ type: 'number', example: 6565656 })
  @IsNumber()
  clientDate: number;
}
