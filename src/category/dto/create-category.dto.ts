import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: 'string',
    example: 'شاورما',
    description: 'The name of the type or category to be created',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Type name is required' })
  @MaxLength(100, { message: 'Type name must not exceed 100 characters' })
  type: string;

  @ApiProperty({
    type: 'string',
    example: 'طعام',
    required: false,
    description:
      'The parent category name. If provided, creates a type under this category. If not provided, creates a new category.',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  category: string;
}
