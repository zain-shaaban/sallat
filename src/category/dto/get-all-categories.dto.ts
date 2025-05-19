import { ApiProperty } from '@nestjs/swagger';

export class GetAllCategoriesDto {
  @ApiProperty({
    type: 'boolean',
    example: true,
    description: 'Indicates whether the request was successful',
  })
  status: boolean;

  @ApiProperty({
    type: 'array',
    description:
      'The hierarchical data structure containing categories and their types',
    example: [
      {
        type: 'طعام',
        types: [
          { type: 'شاورما' },
          { type: 'بطاطا صاج' },
          { type: 'برجر' },
          { type: 'بيتزا' },
          { type: 'سندويتشات' },
        ],
      },
      {
        type: 'مشروبات',
        types: [
          { type: 'عصير برتقال' },
          { type: 'كولا' },
          { type: 'عصير تفاح' },
          { type: 'ماء' },
          { type: 'عصير مانجو' },
        ],
      },
      {
        type: 'حلويات',
        types: [
          { type: 'كنافة' },
          { type: 'بقلاوة' },
          { type: 'كيك' },
          { type: 'آيس كريم' },
        ],
      },
    ],
  })
  data: Array<{
    type: string;
    types: Array<{ type: string }>;
  }>;
}
