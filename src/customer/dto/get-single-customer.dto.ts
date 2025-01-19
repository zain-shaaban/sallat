import { ApiProperty } from '@nestjs/swagger';
import { GetCustomerData } from './get-all-customers.dto';

export class GetSingleCustomerDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetCustomerData })
  data: GetCustomerData;
}
