import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../../vendor/entities/vendor.entity';

export class GetSingleVendorDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Vendor })
  data: Vendor;
}
