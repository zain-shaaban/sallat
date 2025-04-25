import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Trip } from 'src/trip/entities/trip.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

class location {
  @ApiProperty({ type: 'number', example: 4544.232 })
  lng: number;

  @ApiProperty({ type: 'number', example: 454.232 })
  lat: number;
}

@Entity('sallat_vendors')
export class Vendor {
  @ApiProperty({
    type: 'string',
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @PrimaryGeneratedColumn('uuid')
  vendorID: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column({ type: 'varchar'})
  name: string;

  @ApiProperty({ type: location })
  @Column({
    type: 'jsonb',
    default: {},
  })
  location: location;

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: 'boolean', default: false })
  partner: boolean;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Column({ type: 'varchar', nullable: true })
  email: string;

  @ApiProperty({ type: 'string', example: 'example123' })
  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password: string;

  @OneToMany(() => Trip, (trip) => trip.vendor)
  trips: Trip[];
}
