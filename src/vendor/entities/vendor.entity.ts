import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { IsNotEmpty, IsString, MaxLength, IsPhoneNumber } from 'class-validator';

@Entity('sallat_vendors')
export class Vendor {
  @ApiProperty({
    type: 'string',
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
    description: 'Unique identifier for the vendor',
  })
  @PrimaryGeneratedColumn('uuid')
  vendorID: string;

  @ApiProperty({ 
    type: 'string', 
    example: '+962798765432',
    description: 'Vendor\'s contact phone number',
    maxLength: 20
  })
  @Column({ type: 'varchar', length: 20, nullable: false })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ 
    type: 'string', 
    example: 'Restaurant Name',
    description: 'Name of the vendor business',
    maxLength: 200
  })
  @Column({ type: 'varchar', length: 200, nullable: false })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Geographic location of the vendor',
    example: {
      coords: {
        lat: 31.9539,
        lng: 35.9106,
      },
      approximate: true,
      description: 'بجانب المحكمة',
    },
    required: true,
  })
  @Column({ type: 'jsonb', nullable: false })
  @IsNotEmpty()
  location: LocationDto;

  @OneToMany(() => Trip, (trip) => trip.vendor)
  trips: Trip[];
}
