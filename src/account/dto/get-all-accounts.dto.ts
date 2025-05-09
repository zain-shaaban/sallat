import { ApiProperty } from '@nestjs/swagger';
import { Account } from '../entities/account.entity';
import { IAccountListResponse } from '../interfaces/account.interface';

export class GetAllAccountsDto implements IAccountListResponse {
  @ApiProperty({
    example: true,
    description: 'Operation status',
  })
  status: boolean;

  @ApiProperty({
    type: Account,
    description: 'List of all accounts in the system',
    isArray: true,
  })
  data: Account[];
}
