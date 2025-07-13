import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_partner_trips')
export class PartnerTrips {
  @PrimaryGeneratedColumn()
  requestID: number;

  @Column()
  partnerID: string;

  @Column()
  partnerName: string;

  @Column()
  customerName: string;

  @Column()
  customerPhoneNumber: string;

  @Column({ default: 'pending' })
  state: string;

  @CreateDateColumn()
  createdAt: Date;
}
