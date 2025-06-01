import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_sessions')
export class Session {
  @ApiProperty({
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier of the session',
  })
  @PrimaryGeneratedColumn('uuid')
  sessionID: string;

  @ApiProperty({
    type: 'string',
    example: '2025-05-30T22:10:53.592Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: 1748281061291,
    description: 'Start date of session by milli second',
    type: 'number',
  })
  @Column({ type: 'bigint' })
  startDate: number;

  @ApiProperty({
    example: '#277DA1',
    description: 'Raw color',
    type: 'string',
  })
  @Column({ type: 'varchar' })
  color: string;

  @ApiProperty({
    example: '3c559f4a-ef14-4e62-8874-384a89c8689e',
    description: 'Unique identifier of the driver',
  })
  @Column({ type: 'varchar' })
  driverID: string;

  @ApiProperty({
    example: 'ABC123',
    description: 'Vehicle number assigned to driver',
    required: false,
  })
  @Column({ type: 'varchar' })
  vehicleNumber: string;

  @ApiProperty({
    example: [
      {
        time: 1748281061291,
        coords: {
          lat: 34.8851565,
          lng: 35.8805156,
        },
        accuracy: 4.274,
      },
      {
        time: 1748281069996,
        coords: {
          lat: 34.8848103,
          lng: 35.8807436,
        },
        accuracy: 3.316,
      },
    ],
    description: 'locations array of the path',
    type: [Object],
  })
  @Column({ type: 'jsonb' })
  locations: any[];

  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @Column({ type: 'int' })
  number: number;
}
