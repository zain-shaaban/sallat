import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  ArrayMinSize,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto';

export class CreateCustomerDtoRequest {
  @ApiProperty({
    example: ['+96399887766', '+96399988877'],
    description: 'Array of phone numbers associated with the customer',
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  // @Matches(/^[^a-zA-Z]+$/, {
  //   message: 'Each phone number must be valid',
  //   each: true,
  // })
  phoneNumbers: string[];

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the customer',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Geographic location of the customer',
    example: {
      coords: {
        lat: 58.16543232,
        lng: 36.18875421,
      },
      approximate: true,
      description: 'بجانب المحكمة',
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class CreateCustomerData {
  @ApiProperty({
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier of the created customer',
  })
  customerID: string;
}

export class CreateCustomerDtoResponse {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  status: boolean;

  @ApiProperty({
    type: CreateCustomerData,
    description: 'Data of the created customer',
  })
  data: CreateCustomerData;
}
