import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriverMetadata } from './driverMetadata.entity';

@Entity('sallat_accounts', { orderBy: { createdAt: 'ASC' } })
export class Account {
  @ApiProperty({
    type: 'string',
    example: '09eea85b-85d3-4d8a-8e41-a6a5af12c546',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column()
  name: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ unique: true })
  password: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ example: 'driver', required: true })
  @Column()
  role: string;

  @ApiProperty({ type: 'number', example: 1500000.0 })
  @Column({ type: 'float', nullable: true })
  salary: number;

  @OneToOne(() => DriverMetadata, (profile) => profile.account, {
    cascade: true,
  })
  driverMetadata?: DriverMetadata;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;
}
