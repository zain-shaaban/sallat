import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Geographic location of the customer',
    example: {
      coords: {
        lat: 58.16543232,
        lng: 36.18875421,
      },
      approximate: true,
      description: 'بجانب المحكمة',
    },
    required: false,
  })
  @Column({ type: 'jsonb' })
  location: LocationDto;

  @OneToMany(() => Trip, (trip) => trip.vendor)
  trips: Trip[];
}
