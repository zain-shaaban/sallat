import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDtoRequest } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDtoRequest) {}
