import {ApiProperty } from '@nestjs/swagger';
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
} from 'sequelize-typescript';

@Table({ tableName: 'cc' })
export class Cc extends Model {
  @ApiProperty({type:'number',example:30})
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  ccID: number;

  @ApiProperty({type:'string',example:'0999888777'})
  @AllowNull(false)
  @Column(DataType.STRING)
  phoneNumber: string;

  @ApiProperty({type:'string',example:'example example'})
  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @ApiProperty({type:'string',example:'example@gmail.com'})
  @Validate({ isEmail: true })
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  password: string;

  @ApiProperty({type:'number',example:1500000.00})
  @Column(DataType.FLOAT)
  salary: number;
}
