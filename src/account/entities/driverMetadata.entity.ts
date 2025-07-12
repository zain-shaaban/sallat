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
  @ApiProperty({
    type: 'string',
    example: '09eea85b-85d3-4d8a-8e41-a6a5af12c546',
    description: 'Unique identifier for the driver profile',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: 'string',
    example: '332211',
    description: 'Vehicle number assigned to the driver for deliveries',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  assignedVehicleNumber: string;

  @ApiProperty({
    type: 'string',
    example: 'tokentokentokentokentoken',
    description: 'Firebase Cloud Messaging token for push notifications',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  notificationToken: string;

  @ApiProperty({
    type: 'string',
    example: 'P023',
    description: 'code name unique for each driver',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  code: string;

  @OneToOne(() => Account, (account) => account.driverMetadata, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  account: Account;
}