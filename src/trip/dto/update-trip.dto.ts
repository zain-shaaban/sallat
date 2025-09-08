import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class Discounts {
  @ApiProperty({
    type: 'number',
    description: 'discounts from items',
    example: 0.2,
  })
  @IsNumber()
  @IsNotEmpty()
  item: number;

  @ApiProperty({
    type: 'number',
    description: 'discounts from delivery',
    example: 0.4,
  })
  @IsNumber()
  @IsNotEmpty()
  delivery: number;
}

export class ReceiptItemDto {
  @ApiProperty({
    type: String,
    description: 'Item name',
    example: 'سندويشة فلافل صاج',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Price of the item',
    example: 12000,
  })
  @IsNumber()
  price: number;
}

export class UpdateTripDto {
  @ApiProperty({
    type: 'array',
    example: ['شاورما', 'بطاطا مقلية كاسة'],
    description: 'List of items to be delivered in this trip',
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  itemTypes?: string[];

  @ApiProperty({
    type: 'string',
    example: 'الشاورما بدون خل والبطاطا عبيلي ياها كريم توم',
    description: 'Additional notes or special instructions for the delivery',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    type: 'number',
    example: 5200,
    description: 'Distance of the trip in meters',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  distance?: number;

  @ApiProperty({
    type: 'number',
    example: 80000,
    description: 'Price of the trip in the local currency',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    type: ReceiptItemDto,
    description: 'Receipt details',
    isArray: true,
    example: [
      {
        name: 'سندويشة فلافل صاج',
        price: 12000,
      },
      {
        name: 'شاورما دجاج',
        price: 25000,
      },
    ],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  @IsOptional()
  receipt?: ReceiptItemDto[];

  @ApiProperty({
    type: String,
    description: 'Reason of cancel trip',
    example: 'انفجر الدولاب',
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: true,
    description: 'To determine if the trip is a partner or not.',
  })
  @IsBoolean()
  @IsOptional()
  partner?: boolean;

  @ApiProperty({
    type: Discounts,
    description: 'Discounts from the price',
    example: {
      item: 0.2,
      delivery: 0.4,
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Discounts)
  discounts?: Discounts;

  @ApiProperty({
    type: 'number',
    example: 9000,
    description: 'Fixed price of the trip in the local currency',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  fixedPrice?: number;

  @ApiProperty({
    type: 'string',
    example: 'العميل لم يرد على الاتصال',
    description: 'note about problem or something else in the trip',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    type: 'number',
    example: 888.666,
    description: 'Distance traveled but not paid',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  unpaidDistance?: number;

  @ApiProperty({
    type:Boolean,
    description:"Determine whether the message has been sent or not",
    example:false
  })
  @IsOptional()
  @IsBoolean()
  isSMSSend?:boolean
}
