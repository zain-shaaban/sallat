import { ApiProperty } from '@nestjs/swagger';
import { Manager } from '../entities/manager.entity';

export class GetSingleManagerDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Manager })
  data: Manager;
}
