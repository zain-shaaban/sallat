import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_partner_trips')
export class PartnerTrips {
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
