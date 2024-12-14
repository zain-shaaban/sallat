import { ApiProperty } from '@nestjs/swagger';
import { Driver } from '../entities/driver.entity';

class DriverData {
  @ApiProperty({ example: 1 })
  NumberOfDrivers: number;
  @ApiProperty({ type: [Driver] })
  allDrivers: Driver[];
}

export class GetAllDriversDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: DriverData })
  data: DriverData;
}
