import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('sallat_driver_profiles')
export class DriverMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', example: '332211' })
  @Column({ type: 'varchar', nullable: true })
  assignedVehicleNumber: string;

  @ApiProperty({ type: 'string', example: 'tokentokentokentokentoken' })
  @Column({ type: 'varchar', nullable: true })
  notificationToken: string;

  @OneToOne(() => Account, (account) => account.driverMetadata, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  account: Account;
}