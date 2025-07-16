import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddNoteDto {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'trip id',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  tripID: string;

  @ApiProperty({
    type: 'string',
    example: 'العميل لم يرد على الاتصال',
    description: 'note about problem or something else in the trip',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}
