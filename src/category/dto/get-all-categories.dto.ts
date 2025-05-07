import { ApiProperty } from '@nestjs/swagger';

class ItemData {
  @ApiProperty({ 
    type: 'string', 
    example: 'شاورما',
    description: 'The name of the type/item'
  })
  type: string;
}

class CategoryData {
  @ApiProperty({ 
    type: 'string', 
    example: 'طعام',
    description: 'The name of the category'
  })
  type: string;

  @ApiProperty({ 
    type: ItemData, 
    isArray: true,
    description: 'Array of types/items belonging to this category'
  })
  types: ItemData[];
}

export class GetAllCategoriesDto {
  @ApiProperty({ 
    type: 'boolean', 
    example: true,
    description: 'Indicates whether the request was successful'
  })
  status: boolean;

  @ApiProperty({ 
    type: CategoryData,
    description: 'The hierarchical data structure containing categories and their types'
  })
  data: CategoryData;
}
