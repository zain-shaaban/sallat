import { ApiProperty } from '@nestjs/swagger';
import { Cc } from '../entities/cc.entity';

class CcDataSingle {
  @ApiProperty({ type: Cc })
  cc: Cc;
}

export class GetSingleCcDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CcDataSingle })
  data: CcDataSingle;
}
