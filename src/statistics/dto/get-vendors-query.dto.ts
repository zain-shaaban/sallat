import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class GetVendorsQueryDTO {
  @ApiProperty({
    description: 'Filter by vendor name',
    example: 'Acme Corp',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Filter by vendor phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phoneNumber?: string;

  @ApiProperty({
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page: number = 1;

  @ApiProperty({
    description: 'The limit of the vendors per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  limit: number = 20;

  @ApiProperty({
    description: 'The sort by field',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy: string = 'createdAt';

  @ApiProperty({
    description: 'The order of the vendors',
    example: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  order: string = 'DESC';
}
