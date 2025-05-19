import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ 
    type: 'boolean', 
    example: false,
    description: 'Flag to indicate whether updating a category (true) or a type (false)'
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'isCategory flag is required' })
  isCategory: boolean;

  @ApiProperty({ 
    type: 'string', 
    example: 'شاورما',
    description: 'The current name of the category or type to be updated',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Current name is required' })
  @MaxLength(100, { message: 'Current name must not exceed 100 characters' })
  oldType: string;

  @ApiProperty({ 
    type: 'string', 
    example: 'بطاطا صاج',
    description: 'The new name to update the category or type to',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'New name is required' })
  @MaxLength(100, { message: 'New name must not exceed 100 characters' })
  newType: string;
}
