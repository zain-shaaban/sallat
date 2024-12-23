import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  PrimaryKey,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Category } from './category.entity';

@Table({ tableName: 'item', timestamps: false })
export class Item extends Model {
  @ApiProperty({ type: 'string', example: 'شاورما' })
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
  type: string;

  @ApiProperty({ type: 'string', example: 'طعام' })
  @ForeignKey(() => Category)
  @Column
  category: string;
}
