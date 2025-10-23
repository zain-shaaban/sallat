import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateVendorDtoRequest } from './create-vendor.dto';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateVendorDto extends PartialType(CreateVendorDtoRequest) {
  @ApiProperty({
    type: 'string',
    example: 'يتاخر عادة في تنفيذ الطلب',
    description: 'note about problem or something else abount the customer',
    required: false,
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @MaxLength(500)
  note: string;
}
