import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_trips')
export class Trip {
  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @PrimaryGeneratedColumn('uuid')
  tripID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @Column({ type: 'varchar', nullable: true })
  ccID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @Column({ type: 'varchar', nullable: true })
  driverID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @Column({ type: 'varchar', nullable: true })
  vendorID: string;

  @ApiProperty({
    type: 'string',
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
  })
  @Column({ type: 'varchar', nullable: true })
  customerID: string;

  @ApiProperty({ type: 'string', example: '123456' })
  @Column({ type: 'varchar', nullable: true })
  vehicleNumber: string;

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: 'boolean', default: false })
  alternative: boolean;

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: 'boolean', default: false })
  partnership: boolean;

  @ApiProperty({ type: 'array', example: ['شاورما', 'بطاطا مقلية'] })
  @Column({ type: 'jsonb', default: [] })
  itemTypes: string[];

  @ApiProperty({
    type: Object,
    description: 'Custom object with flexible structure',
  })
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  tripState: object;

  @ApiProperty({ type: 'string', example: 'كتر كتشب' })
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ApiProperty({ type: 'number', example: 4545.23 })
  @Column({ type: 'float', nullable: true })
  approxDistance: number;

  @ApiProperty({ type: 'number', example: 888.666 })
  @Column({ type: 'float', nullable: true })
  distance: number;

  @ApiProperty({ type: 'number', example: 6000.0 })
  @Column({ type: 'float', nullable: true })
  approxPrice: number;

  @ApiProperty({ type: 'number', example: 6200.0 })
  @Column({ type: 'float', nullable: true })
  price: number;

  @ApiProperty({ type: 'number', example: 14000.0 })
  @Column({ type: 'float', nullable: true })
  itemPrice: number;

  @ApiProperty({ type: 'number', example: 6666 })
  @Column({ type: 'bigint', nullable: true })
  approxTime: number;

  @ApiProperty({ type: 'number', example: 9000.0 })
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
  rawPath: object[];

  @ApiProperty({
    type: 'array',
    example: [
      { lng: 111.111, lat: 112.222 },
      { lng: 888.888, lat: 999.999 },
      { lng: 555.555, lat: 333.333 },
    ],
  })
  @Column({ type: 'jsonb', default: [] })
  routedPath: object[];

  @ApiProperty({
    type: 'array',
    example: [
      { lng: 111.111, lat: 112.222 },
      { lng: 888.888, lat: 999.999 },
      { lng: 555.555, lat: 333.333 },
    ],
  })
  @Column({ type: 'jsonb', default: [] })
  matchedPath: object[];

  @ApiProperty({ type: 'boolean', example: true })
  @Column({ type: 'boolean', default: false })
  success: boolean;

  @ApiProperty({ type: 'string', example: '2025-01-01 14:32:57.973928' })
  @CreateDateColumn()
  createAt: Date;
}
