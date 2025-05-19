import { ApiProperty } from '@nestjs/swagger';

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sallat_categories')
export class Category {
  @ApiProperty({
    type: 'string',
    example: 'طعام',
    description: 'The primary identifier for a category. This is a unique value that represents the main category name.',
    required: true
  })
  @PrimaryColumn({ unique: true, type: 'varchar' })
  type: string;

  @ApiProperty({
    type: [String],
    example: ['pizza', 'burger', 'sandwich'],
    description: 'An array of items belonging to the category. These are the sub-items or related items within the main category.',
    default: [],
    isArray: true
  })
  @Column('text', { array: true, default: [] })
  types: string[];
}
