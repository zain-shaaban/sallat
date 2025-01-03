import {
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Table,
  Unique,
  Model
} from 'sequelize-typescript';

@Table({ tableName: 'trip', timestamps: false })
export class Trip extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  tripID: number;

  @Column(DataType.INTEGER)
  ccID: number;

  @Column(DataType.INTEGER)
  driverID: number;

  @Column(DataType.INTEGER)
  vendorID: number;

  @Column(DataType.INTEGER)
  customerID: number;

  @Column(DataType.TEXT)
  vehicleNumber: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  alternative: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  partnership: boolean;

  @Column({ type: DataType.JSON, defaultValue: [] })
  itemTypes: string[];

  @Column(DataType.STRING)
  description: string;

  @Column(DataType.INTEGER)
  approxDistance: number;

  @Column(DataType.INTEGER)
  distance: number;

  @Column(DataType.FLOAT)
  approxPrice: number;

  @Column(DataType.FLOAT)
  price: number;

  @Column(DataType.FLOAT)
  totalPrice: number;

  @Column(DataType.BIGINT)
  approxTime: number;

  @Column(DataType.BIGINT)
  time: number;

  @Column({ type: DataType.JSON, defaultValue: [] })
  path: string[];

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  success: boolean;
}