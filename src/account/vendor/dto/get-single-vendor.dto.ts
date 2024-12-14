import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../entities/vendor.entity';

class VendorDataSingle {
  @ApiProperty({ type: Vendor })
  vendor:Vendor;
}

export class GetSingleVendorDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: VendorDataSingle })
  data: VendorDataSingle;
}
