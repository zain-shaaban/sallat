import { ApiProperty } from '@nestjs/swagger';

import { Category } from './category.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('sallat_items')
export class Item {
  @ApiProperty({ type: 'string', example: 'شاورما' })
  @PrimaryColumn({
    unique: true,
    type: 'varchar',
  })
  type: string;

  @ApiProperty({ type: 'string', example: 'طعام' })
  @Column()
  category: string;
}
