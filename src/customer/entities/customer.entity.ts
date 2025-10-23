import { ApiProperty } from '@nestjs/swagger';
import { Trip } from 'src/trip/entities/trip.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LocationDto } from '../dto/location.dto';

@Entity('sallat_customers')
export class Customer {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier for the customer',
  })
  @PrimaryGeneratedColumn('uuid')
  customerID: string;

  @ApiProperty({
    type: 'string',
    example: 'John Doe',
    description: 'Full name of the customer',
    minLength: 2,
    maxLength: 200,
  })
  @Column()
  name: string;

  @ApiProperty({
    type: 'array',
    example: ['+96399887766', '+96399988877'],
    description: 'Array of phone numbers associated with the customer',
  })
  @Column({ type: 'text', array: true })
  phoneNumbers: string[];

  @ApiProperty({
    description: 'Geographic location of the customer',
    example: {
      lat: 65.565656,
      lng: 98.989898,
    },
  })
  @Column({ type: 'jsonb' })
  location: LocationDto;

  @ApiProperty({
    type: 'string',
    example: 'العميل لم يرد على الاتصال',
    description: 'note about problem or something else in the trip',
    required: false,
  })
  @Column({ nullable: true, type: 'text' })
  note: string;

  @Column({ nullable: true })
  telegramID: string;

  @ApiProperty({
    type: () => Trip,
    isArray: true,
    description: 'Associated trips for this customer',
  })
  @OneToMany(() => Trip, (trip) => trip.customer)
  trips: Trip[];

  @ApiProperty({
    type: 'string',
    example: '2025-01-01 14:32:57.973928',
    description: 'Timestamp when the customer was created',
  })
  @CreateDateColumn()
  createdAt: Date;
}
