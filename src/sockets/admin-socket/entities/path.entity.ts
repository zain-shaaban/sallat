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

  @Column({
    type: DataType.JSON,
    allowNull: false,
    get() {
      const value = this.getDataValue('path');
      return value ? JSON.parse(value) : {};
    },
  })
  path: string;

  @Column(DataType.BIGINT)
  date: number;
}
