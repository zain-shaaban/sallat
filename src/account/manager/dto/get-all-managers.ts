import { ApiProperty } from '@nestjs/swagger';
import { Manager } from '../entities/manager.entity';

class GetAllData {
  @ApiProperty({ example: 1 })
  NumberOfManager: number;
  @ApiProperty({ type: [Manager] })
  allManagers: Manager[];
}

export class GetAllManagersDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetAllData })
  data: GetAllData;
}
