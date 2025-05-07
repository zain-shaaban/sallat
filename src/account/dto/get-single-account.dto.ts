import { ApiProperty } from '@nestjs/swagger';
import { Account } from '../entities/account.entity';

export class GetSingleAccountDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Account })
  data: Account;
}
