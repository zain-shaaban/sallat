import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Max } from 'class-validator';

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
  @ApiProperty({ type: 'number', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  @Max(1000000)
  driverID: number;

  @ApiProperty({ type: location })
  @IsOptional()
  location: location;
}
