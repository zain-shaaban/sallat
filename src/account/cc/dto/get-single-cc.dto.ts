import { ApiProperty } from '@nestjs/swagger';
import { Cc } from '../entities/cc.entity';

export class GetSingleCcDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Cc })
  data: Cc;
}
