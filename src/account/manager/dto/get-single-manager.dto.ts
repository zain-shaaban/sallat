import { ApiProperty } from '@nestjs/swagger';
import { Manager } from '../entities/manager.entity';

class GetSingleData {
  @ApiProperty({ type: Manager })
  manager:Manager;
}

export class GetSingleManagerDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetSingleData })
  data: GetSingleData;
}
