import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class GetCustomersQueryDTO {
  @ApiProperty({
    description: 'Filter by customer name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Filter by customer phone number',
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
    description: 'The limit of the customers per page',
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
    description: 'The order of the customers',
    example: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  order: string = 'DESC';
}
