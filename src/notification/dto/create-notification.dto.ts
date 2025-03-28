import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: '3c559f4a-ef14-4e62-8874-384a89c8689e' })
  @IsString()
  @IsNotEmpty()
  driverID: string;

  @ApiProperty({ example: 'come to the office' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'hello my name is khaled' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
