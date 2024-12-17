import { ApiProperty } from '@nestjs/swagger';
import { Cc } from '../entities/cc.entity';

export class GetAllCcDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Cc, isArray: true })
  data: Cc[];
}
