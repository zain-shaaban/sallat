import { ApiProperty } from '@nestjs/swagger';
import { Driver } from '../entities/driver.entity';

export class GetAllDriversDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Driver, isArray: true })
  data: Driver[];
}
