import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CoordinatesDto } from 'src/customer/dto/location.dto';

export class TripIdDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;
}

export class AssignRoutedPathDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinatesDto)
  routedPath: CoordinatesDto[];
}

export class AssignNewDriverDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;

  @IsString()
  @IsNotEmpty()
  driverID: string;
}

export class SetAvailableDto {
  @IsBoolean()
  available: boolean;

  @IsString()
  @IsNotEmpty()
  driverID: string;
}

export class ChangePartnerAvailabilityDto {
  @IsBoolean()
  @IsNotEmpty()
  availability: boolean;
}

export class TripStateDto{
  @IsString()
  @IsNotEmpty()
  vendorID:string

  @IsString()
  @IsNotEmpty()
  vendorName:string
}
