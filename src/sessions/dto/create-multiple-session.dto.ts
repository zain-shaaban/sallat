import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSessionDto } from './create-session.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultipleSessionsDto {
  @ApiProperty({
    type: CreateSessionDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSessionDto)
  sessions: CreateSessionDto[];
}
