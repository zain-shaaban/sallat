import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CoordinatesDto } from 'src/customer/dto/location.dto';

export class sendLocationDto {
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
}
