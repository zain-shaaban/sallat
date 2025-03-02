import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  driverID: number;

  @ApiProperty({ example: 'come to the office' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'hello my name is khaled' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
