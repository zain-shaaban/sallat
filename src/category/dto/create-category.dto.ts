import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto{
  @ApiProperty({ type: 'string', example: 'شاورما' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @ApiProperty({ type: 'string', example: 'طعام', required: false ,description:'if there is a category'})
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category: string;
}