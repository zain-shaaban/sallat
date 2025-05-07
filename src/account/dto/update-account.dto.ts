import { PartialType } from '@nestjs/swagger';
import { CreateAccountDtoRequest } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDtoRequest) {}
