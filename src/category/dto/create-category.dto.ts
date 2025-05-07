import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto{
  @ApiProperty({ 
    type: 'string', 
    example: 'شاورما',
    description: 'The name of the type or category to be created',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @ApiProperty({ 
    type: 'string', 
    example: 'طعام', 
    required: false,
    description: 'The parent category name. If provided, creates a type under this category. If not provided, creates a new category.'
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category: string;
}