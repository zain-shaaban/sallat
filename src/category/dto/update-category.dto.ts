import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ 
    type: 'boolean', 
    example: false,
    description: 'Flag to indicate whether updating a category (true) or a type (false)'
  })
  @IsBoolean()
  @IsNotEmpty()
  isCategory: boolean;

  @ApiProperty({ 
    type: 'string', 
    example: 'شاورما',
    description: 'The current name of the category or type to be updated',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  oldType: string;

  @ApiProperty({ 
    type: 'string', 
    example: 'بطاطا صاج',
    description: 'The new name to update the category or type to',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newType: string;
}
