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

  @CreateDateColumn()
  date: string;
}
