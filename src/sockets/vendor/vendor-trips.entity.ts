import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_vendor_trips')
export class VendorTrips {
  @PrimaryGeneratedColumn()
  tripID: number;

  @Column()
  vendorID: string;

  @Column()
  customerName: string;

  @Column()
  customerPhoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;
}
