import {
  Column,
  DataType,
  Table,
  Model,
  PrimaryKey,
  Unique,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({ tableName: 'path', timestamps: false })
export class Path extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  pathID: number;

  @Column(DataType.TEXT)
  path: string;

  @Column(DataType.BIGINT)
  date: number;
}