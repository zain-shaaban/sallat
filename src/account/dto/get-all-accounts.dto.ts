import { ApiProperty } from '@nestjs/swagger';
import { Account } from '../entities/account.entity';

export class GetAllAccountsDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Account, isArray: true })
  data: Account[];
}
