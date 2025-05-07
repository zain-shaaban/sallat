import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({ 
    type: 'boolean', 
    example: false,
    description: 'Flag to indicate whether deleting a category (true) or a type (false)'
  })
  @IsBoolean()
  @IsNotEmpty()
  isCategory: boolean;

  @ApiProperty({ 
    type: 'string', 
    example: 'شاورما',
    description: 'The name of the category or type to be deleted',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;
}
