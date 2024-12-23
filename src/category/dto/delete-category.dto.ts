import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({ type: 'boolean', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isCategory: boolean;

  @ApiProperty({ type: 'string', example: 'شاورما' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;
}
