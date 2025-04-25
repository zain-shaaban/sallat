import { ApiProperty } from '@nestjs/swagger';
import { Trip } from 'src/trip/entities/trip.entity';
import {
  Check,
  Column,
  CreateDateColumn,
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

@Entity('sallat_customers')
export class Customer {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @PrimaryGeneratedColumn('uuid')
  customerID: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column()
  name: string;

  @ApiProperty({ type: 'array', example: ['+96399887766', '+96399988877'] })
  @Column({ type: 'text', array: true })
  phoneNumber: string[];

  @ApiProperty({ type: location })
  @Column({ type: 'jsonb' })
  location: location;

  @OneToMany(() => Trip, (trip) => trip.customer)
  trips: Trip[];
}
