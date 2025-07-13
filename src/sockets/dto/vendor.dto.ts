import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewPartnerTrip {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhoneNumber:string;
}
