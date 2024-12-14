import { PartialType } from '@nestjs/swagger';
import { CreateDriverDtoRequest } from './create-driver.dto';

export class UpdateDriverDto extends PartialType(CreateDriverDtoRequest) {}
