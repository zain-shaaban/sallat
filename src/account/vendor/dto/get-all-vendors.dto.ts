import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../entities/vendor.entity';

export class GetAllVendorsDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Vendor,isArray:true })
  data: Vendor[];
}
