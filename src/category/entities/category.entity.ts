import { ApiProperty } from '@nestjs/swagger';

import { Entity, PrimaryColumn } from 'typeorm';

@Entity('sallat_categories')
export class Category {
  @ApiProperty({ type: 'string', example: 'طعام' })
  @PrimaryColumn({ unique: true, type: 'varchar' })
  type: string;
}
