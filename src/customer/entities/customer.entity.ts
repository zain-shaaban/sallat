import { ApiProperty } from '@nestjs/swagger';
import {
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Table,
  Unique,
  Model,
} from 'sequelize-typescript';

class location {
  @ApiProperty({ type: 'number', example: 4544.232 })
  lng: number;

  @ApiProperty({ type: 'number', example: 454.232 })
  lat: number;
}

@Table({ tableName: 'customer', timestamps: false })
export class Customer extends Model {
  @ApiProperty({ type: 'number', example: 20 })
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  customerID: number;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ type: 'string', example: '+96399887766' })
  @Column({ type: DataType.STRING, allowNull: false })
  phoneNumber: string;

  @ApiProperty({ type: location })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    get() {
      const value = this.getDataValue('location');
      return value ? JSON.parse(value) : {};
    },
  })
  location: location;
}
