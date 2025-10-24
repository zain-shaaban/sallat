import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MergeTwoVendorsDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  originalVendorID: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fakeVendorID: string;
}
