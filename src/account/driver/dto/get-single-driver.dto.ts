import { ApiProperty } from '@nestjs/swagger';
import { Driver } from '../entities/driver.entity';

export class GetSingleDriverDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Driver })
  data: Driver;
}
