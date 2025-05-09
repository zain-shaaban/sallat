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
  @IsNotEmpty({ message: 'isCategory flag is required' })
  isCategory: boolean;

  @ApiProperty({ 
    type: 'string', 
    example: 'شاورما',
    description: 'The name of the category or type to be deleted',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Type name is required' })
  @MaxLength(100, { message: 'Type name must not exceed 100 characters' })
  type: string;
}
