import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MergeTwoCustomersDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  originalCustomerID: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fakeCustomerID: string;
}
