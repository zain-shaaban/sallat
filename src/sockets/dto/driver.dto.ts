import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsBoolean,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CoordinatesDto, LocationDto } from 'src/customer/dto/location.dto';

export class TripIdDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;
}

export class LocationUpdateDto {
  @IsDefined({ message: 'Location should be defined' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coords: CoordinatesDto;

  @IsNumber()
  clientDate: number;
}

export class AcceptTripDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNumber()
  time: number;
}

export class WayPointDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNumber()
  time: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class AddWayPointDto {
  @ValidateNested()
  @Type(() => WayPointDto)
  wayPoint: WayPointDto;

  @IsString()
  @IsNotEmpty()
  tripID: string;
}

export class StateDataDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNumber()
  time: number;
}

export class ChangeStateDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;

  @IsString()
  @IsNotEmpty()
  stateName: string;

  @ValidateNested()
  @Type(() => StateDataDto)
  stateData: StateDataDto;
}

export class ReceiptItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;
}

export class EndTripDto {
  @IsString()
  @IsNotEmpty()
  tripID: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  receipt: ReceiptItemDto[];

  @IsNumber()
  itemPrice: number;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  time: number;
}

export class AvailabilityDto {
  @IsBoolean()
  @IsNotEmpty()
  available: boolean;
}
