import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ type: 'boolean', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isCategory: boolean;

  @ApiProperty({ type: 'string', example: 'شاورما' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  oldType: string;

  @ApiProperty({ type: 'string', example: 'بطاطا صاج' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newType: string;
}
