import { PartialType } from '@nestjs/swagger';
import { CreateCcDtoRequest } from './create-cc.dto';

export class UpdateCcDto extends PartialType(CreateCcDtoRequest) {}
