import {ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
} from 'sequelize-typescript';

class location {
    @ApiProperty({ type: 'number', example: 4544.232 })
    lng: number;
  
    @ApiProperty({ type: 'number', example: 454.232 })
    lat: number;
  }

@Table({ tableName: 'vendor' })
export class Vendor extends Model {
  @ApiProperty({type:'number',example:30})
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  vendorID: number;

  @ApiProperty({type:'string',example:'0999888777'})
  @Column(DataType.STRING)
  phoneNumber: string;

  @ApiProperty({type:'string',example:'example example'})
  @Column(DataType.STRING)
  name: string;

  @ApiProperty({ type: location })
  @Column({
    type: DataType.STRING,
    get() {
      const value = this.getDataValue('location');
      return value ? JSON.parse(value) : {};
    },
  })
  location: location;

  @ApiProperty({type:'boolean',example:false})
  @Default(false)
  @Column(DataType.BOOLEAN)
  partner: boolean;

  @ApiProperty({type:'string',example:'example@gmail.com'})
  @Column(DataType.STRING)
  email: string;

  @ApiProperty({type:'string',example:'example123'})
  @Column(DataType.STRING)
  password: string;
}
