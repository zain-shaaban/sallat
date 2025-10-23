import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCustomerDtoRequest } from './create-customer.dto';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDtoRequest) {
  @ApiProperty({
    type: 'string',
    example: 'العميل لم يرد على الاتصال',
    description: 'note about problem or something else abount the customer',
    required: false,
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)  @IsString()
  @MaxLength(500)
  note: string;
}
