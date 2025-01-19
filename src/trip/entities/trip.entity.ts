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

@Table({ tableName: 'trip', timestamps: false })
export class Trip extends Model {
  @ApiProperty({ type: 'number', example: 20 })
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  tripID: number;

  @ApiProperty({ type: 'number', example: 50 })
  @Column(DataType.INTEGER)
  ccID: number;

  @ApiProperty({ type: 'number', example: 23 })
  @Column(DataType.INTEGER)
  driverID: number;

  @ApiProperty({ type: 'number', example: 18 })
  @Column(DataType.INTEGER)
  vendorID: number;

  @ApiProperty({ type: 'number', example: 11 })
  @Column(DataType.INTEGER)
  customerID: number;

  @ApiProperty({ type: 'string', example: '123456' })
  @Column(DataType.TEXT)
  vehicleNumber: string;

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  alternative: boolean;

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  partnership: boolean;

  @ApiProperty({ type: 'array', example: ['شاورما', 'بطاطا مقلية'] })
  @Column({
    type: DataType.STRING,
    defaultValue: [],
    get() {
      const value = this.getDataValue('itemTypes');
      return value ? JSON.parse(value) : [];
    },
  })
  itemTypes: string[];

  @ApiProperty({ type: 'string', example: 'كتر كتشب' })
  @Column(DataType.STRING)
  description: string;

  @ApiProperty({ type: 'number', example: 4545.23 })
  @Column(DataType.INTEGER)
  approxDistance: number;

  @ApiProperty({ type: 'number', example: 888.666 })
  @Column(DataType.INTEGER)
  distance: number;

  @ApiProperty({ type: 'number', example: 6000.0 })
  @Column(DataType.FLOAT)
  approxPrice: number;

  @ApiProperty({ type: 'number', example: 6200.0 })
  @Column(DataType.FLOAT)
  price: number;

  @ApiProperty({ type: 'number', example: 14000.0 })
  @Column(DataType.FLOAT)
  totalPrice: number;

  @ApiProperty({ type: 'number', example: 6666 })
  @Column(DataType.BIGINT)
  approxTime: number;

  @ApiProperty({ type: 'number', example: 9000.0 })
  @Column(DataType.BIGINT)
  time: number;

  @ApiProperty({
    type: 'array',
    example: ['654651.3232', '656565.6562', '59999.32'],
  })
  @Column({ type: DataType.JSON, defaultValue: [] })
  path: string[];

  @ApiProperty({ type: 'boolean', example: true })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  success: boolean;
}
