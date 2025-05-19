import { ApiProperty } from '@nestjs/swagger';
import { Account } from '../entities/account.entity';
import { IAccountResponse } from '../interfaces/account.interface';

export class GetSingleAccountDto implements IAccountResponse {
  @ApiProperty({
    example: true,
    description: 'Operation status',
  })
  status: boolean;

  @ApiProperty({
    type: Account,
    description: 'Account details',
    nullable: true,
  })
  data: Account | null;
}
