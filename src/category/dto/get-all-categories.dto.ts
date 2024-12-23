import { ApiProperty } from '@nestjs/swagger';

class ItemData {
  @ApiProperty({ type: 'string', example: 'شاورما' })
  type: string;
}

class CategoryData {
  @ApiProperty({ type: 'string', example: 'طعام' })
  type: string;

  @ApiProperty({ type: ItemData, isArray: true })
  types: ItemData[];
}

export class GetAllCategoriesDto {
  @ApiProperty({ type: 'boolean', example: true })
  status: boolean;

  @ApiProperty({ type: CategoryData })
  data: CategoryData;
}
