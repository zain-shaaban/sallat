import { ApiProperty } from '@nestjs/swagger';
import { Cc } from '../entities/cc.entity';

class CcData {
  @ApiProperty({ example: 1 })
  NumberOfCc: number;
  @ApiProperty({ type: [Cc] })
  allCc: Cc[];
}

export class GetAllCcDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CcData })
  data: CcData;
}
