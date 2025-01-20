import { PartialType } from '@nestjs/swagger';
import { CreateVendorDtoRequest2 } from './create-vendor.dto'; 

export class UpdateVendorDto2 extends PartialType(CreateVendorDtoRequest2) {}
