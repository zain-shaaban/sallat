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

@Table({ tableName: 'customer', timestamps: false })
export class Customer extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataType.INTEGER)
  customerID: number;

  @Column({ type: DataType.STRING, allowNull: false })
  customerName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  customerPhoneNumber: string;

  @Column({
    type:DataType.STRING,
    allowNull: false,
    get() {
      const value = this.getDataValue('customerLocation');
      return value ? JSON.parse(value) : {};
    },
  })
  customerLocation: location;
}
