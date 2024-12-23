import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  PrimaryKey,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'category', timestamps: false })
export class Category extends Model {
  @ApiProperty({ type: 'string', example: 'طعام' })
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
  type: string;
}
