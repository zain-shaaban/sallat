import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
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

export class sendLocationDto {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @IsString()
  @IsNotEmpty()
  driverID: string;

  @ApiProperty({ type: location })
  @IsOptional()
  location: location;

  @ApiProperty({ type: 'number', example: 6565656 })
  @IsNumber()
  clientDate: number;
}
