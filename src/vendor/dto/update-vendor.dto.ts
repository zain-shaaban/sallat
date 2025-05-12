import { PartialType } from '@nestjs/swagger';
import { CreateVendorDtoRequest } from './create-vendor.dto'; 

export class UpdateVendorDto extends PartialType(CreateVendorDtoRequest) {}
