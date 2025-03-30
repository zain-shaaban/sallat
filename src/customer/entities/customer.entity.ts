import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

class location {
  @ApiProperty({ type: 'number', example: 4544.232 })
  lng: number;

  @ApiProperty({ type: 'number', example: 454.232 })
  lat: number;
}

@Entity('sallat_customers', { orderBy: { createdAt: 'ASC' } })
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

  @ApiProperty({ type: 'string', example: '+96399887766' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ type: location })
  @Column({ type: 'jsonb' })
  location: location;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;
}
