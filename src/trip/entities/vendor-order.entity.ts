import {
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Table,
  Unique,
  Model,
} from 'sequelize-typescript';

type location = {
  lat: number;
  lng: number;
};

@Table({ tableName: 'vendorOrder', timestamps: false })
export class VendorOrder extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  vendorID: number;

  @Column({ type: DataType.STRING, allowNull: false })
  vendorName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  vendorPhoneNumber: string;

  @Column({ type: DataType.JSON, allowNull: false ,    get() {
    const value = this.getDataValue('vendorLocation');
    return value ? JSON.parse(value) : {};
  },})
  vendorLocation: location;
}
