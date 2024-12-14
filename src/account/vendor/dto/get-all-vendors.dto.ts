import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../entities/vendor.entity';

class VendorData {
  @ApiProperty({ example: 1 })
  NumberOfVendor: number;
  @ApiProperty({ type: [Vendor] })
  allVendors: Vendor[];
}

export class GetAllVendorsDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: VendorData })
  data: VendorData;
}
