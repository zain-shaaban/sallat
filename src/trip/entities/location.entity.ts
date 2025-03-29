import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_locations')
export class LocationEntity {
  @PrimaryGeneratedColumn()
  locationID: number;

  @Column('varchar')
  driverID: string;

  @Column('jsonb')
  location: object;

  @Column({ type: 'varchar', nullable: true })
  locationSource: string;

  @Column({ type: 'bigint', nullable: true })
  clientDate: number;

  @Column({ type: 'bigint', nullable: true })
  serverDate: number;
}
