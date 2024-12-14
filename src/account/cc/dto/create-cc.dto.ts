import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCcDtoRequest {
  @ApiProperty({ example: 'example example' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'example@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @ApiProperty({
    example: 'example123',
    description: 'Minimum length is 6 character',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(200)
  password: string;

  @ApiProperty({ example: '0999888777' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phoneNumber: string;

  @ApiProperty({ example: 1500000.0, required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;
}

class CreateCcData {
  @ApiProperty({ example: 20 })
  ccID: number;
}

export class CreateCcDtoResponse {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: CreateCcData })
  data: CreateCcData;
}
