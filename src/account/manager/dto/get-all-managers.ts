import { ApiProperty } from '@nestjs/swagger';
import { Manager } from '../entities/manager.entity';

export class GetAllManagersDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Manager,isArray:true })
  data: Manager[];
}
