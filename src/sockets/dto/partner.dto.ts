import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNewPartnerTripDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhoneNumber: string;
}

export class CancelPartnerTripDto {
  @IsNumber()
  @IsNotEmpty()
  requestID: number;
}
