import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewVendorTripDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhoneNumber:string;
}
