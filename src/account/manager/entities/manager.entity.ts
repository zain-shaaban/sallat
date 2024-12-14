import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Validate,
  Default,
} from 'sequelize-typescript';

@Table({ tableName: 'manager' })
export class Manager extends Model {
  @ApiProperty({ type: 'number', example: 30 })
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  managerID: number;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @AllowNull(false)
  @Column(DataType.STRING)
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Validate({ isEmail: true })
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  password: string;

  @ApiProperty({ type: 'number', example: 1500000.0 })
  @Column(DataType.FLOAT)
  salary: number;

  @ApiProperty({ type: 'boolean', example: false })
  @Column(DataType.BOOLEAN)
  superAdmin: boolean;
}
