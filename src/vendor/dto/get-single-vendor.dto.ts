import { ApiProperty } from '@nestjs/swagger';
import { GetVendorData } from './get-all-vendors.dto';

export class GetSingleVendorDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetVendorData })
  data: GetVendorData;
}
