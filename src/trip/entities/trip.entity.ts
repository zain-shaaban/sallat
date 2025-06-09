import { ApiProperty } from '@nestjs/swagger';
import { CoordinatesDto } from 'src/customer/dto/location.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_trips')
export class Trip {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier for the trip',
  })
  @PrimaryGeneratedColumn('uuid')
  tripID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Call center ID associated with the trip',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  ccID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'ID of the driver assigned to this trip',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  driverID: string;

  @ApiProperty({
    type: () => Vendor,
    description: 'The vendor associated with this trip',
    required: false,
  })
  @ManyToOne(() => Vendor, (vendor) => vendor.trips, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn({ name: 'vendorID' })
  vendor: Vendor;

  @ApiProperty({
    type: () => Customer,
    description: 'The customer associated with this trip',
  })
  @ManyToOne(() => Customer, (customer) => customer.trips, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn({ name: 'customerID' })
  customer: Customer;

  @ApiProperty({
    type: 'string',
    example: '123456',
    description: 'Vehicle number assigned to this trip',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  vehicleNumber: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: 'Indicates if this is an alternative trip',
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  alternative: boolean;

  @ApiProperty({
    type: 'array',
    example: ['شاورما', 'بطاطا مقلية'],
    description: 'List of items to be delivered',
    items: {
      type: 'string',
    },
  })
  @Column({ type: 'jsonb', default: [] })
  itemTypes: string[];

  @ApiProperty({
    type: 'object',
    description: 'Current state of the trip',
    example: {
      tripStart: {
        time: 1746897408644,
        location: {
          coords: {
            lat: 34.8927913,
            lng: 35.8892754,
          },
        },
      },
      onVendor: {
        time: 1746897413659,
        location: {
          coords: {
            lat: 34.8927543,
            lng: 35.8892337,
          },
          approximate: false,
        },
      },
      leftVendor: {
        time: 1746898187698,
      },
      tripEnd: {
        time: 1746898200564,
        location: {
          coords: {
            lat: 34.8882025,
            lng: 35.8815156,
          },
          approximate: false,
        },
      },
    },
    additionalProperties: true,
  })
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  tripState: object;

  @ApiProperty({
    type: 'string',
    example: 'كتر كتشب',
    description: 'Additional notes or special instructions',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ApiProperty({
    type: 'number',
    example: 4545.23,
    description: 'Approximate distance in meters',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  approxDistance: number;

  @ApiProperty({
    type: 'number',
    example: 888.666,
    description: 'Actual distance in meters',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  distance: number;

  @ApiProperty({
    type: 'number',
    example: 6000.0,
    description: 'Approximate price in local currency',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  approxPrice: number;

  @ApiProperty({
    type: 'number',
    example: 6200.0,
    description: 'Actual price in local currency',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  price: number;

  @ApiProperty({
    type: 'number',
    example: 14000.0,
    description: 'Total price of items in local currency',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  itemPrice: number;

  @ApiProperty({
    type: 'number',
    example: 6666,
    description: 'Approximate time in milliseconds',
    required: false,
  })
  @Column({ type: 'bigint', nullable: true })
  approxTime: number;

  @ApiProperty({
    type: 'number',
    example: 9000.0,
    description: 'Actual time taken in milliseconds',
    required: false,
  })
  @Column({ type: 'bigint', nullable: true })
  time: number;

  @ApiProperty({
    type: 'array',
    example: [
      { lng: 111.111, lat: 112.222 },
      { lng: 888.888, lat: 999.999 },
      { lng: 555.555, lat: 333.333 },
    ],
  })
  @Column({ type: 'jsonb', default: [] })
  rawPath: CoordinatesDto[];

  @ApiProperty({
    type: 'array',
    example: [
      { lng: 111.111, lat: 112.222 },
      { lng: 888.888, lat: 999.999 },
      { lng: 555.555, lat: 333.333 },
    ],
  })
  @Column({ type: 'jsonb', default: [] })
  routedPath: CoordinatesDto[];

  @ApiProperty({
    type: 'array',
    example: [
      [34.892714, 35.88931],
      [34.892643, 35.889263],
      [34.892323, 35.889051],
    ],
    description: 'Path matched with the planned route',
  })
  @Column({ type: 'jsonb', default: [] })
  matchedPath: [number, number][];

  @ApiProperty({
    type: 'boolean',
    example: true,
    description: 'Indicates if the trip was completed successfully',
    default: false,
  })
  @Column({ default: 'success' })
  status: string;

  @ApiProperty({
    type: 'string',
    example: '2025-01-01 14:32:57.973928',
    description: 'Timestamp when the trip was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    type: 'array',
    description: 'Receipt details for the trip',
    example: [
      {
        name: 'شاورما',
        price: 25000,
      },
    ],
  })
  @Column({ type: 'jsonb', default: [] })
  receipt: { name: string; price: number }[];

  @ApiProperty({
    type: 'string',
    description: "Explain the reasons for the trip's failure.",
    example: 'The customer no longer wants the order.',
  })
  @Column({ nullable: true })
  reason: string;

  @ApiProperty({
    type: 'number',
    description: 'Trip number',
  })
  @Column()
  @Generated('increment')
  tripNumber: number;
}
