import { ApiProperty } from '@nestjs/swagger';
import { Driver } from '../entities/driver.entity';

class DriverDataSingle {
  @ApiProperty({ type: Driver })
  driver:Driver;
}

export class GetSingleDriverDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: DriverDataSingle })
  data: DriverDataSingle;
}
