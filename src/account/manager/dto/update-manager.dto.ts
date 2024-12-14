import { PartialType } from '@nestjs/swagger';
import { CreateManagerDtoRequest } from './create-manager.dto';

export class UpdateManagerDto extends PartialType(CreateManagerDtoRequest) {}
