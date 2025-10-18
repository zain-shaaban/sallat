import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from 'src/customer/dto/location.dto';
import { Trip } from 'src/trip/entities/trip.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

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
    description: "Vendor's contact phone number",
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Exclude()
  @Column({ unique: true, nullable: true })
  password: string;

  @Exclude()
  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password)
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync());
  }

  @Exclude()
  comparePassword(inputPassword: string) {
    return bcrypt.compareSync(inputPassword, this.password);
  }

  @Column({ default: false })
  partner: boolean;

  @ApiProperty({
    type: 'string',
    example: 'Restaurant Name',
    description: 'Name of the vendor business',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200, nullable: false })
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
  location: LocationDto;

  @OneToMany(() => Trip, (trip) => trip.vendor)
  trips: Trip[];

  @ApiProperty({
    type: 'string',
    example: '2025-01-01 14:32:57.973928',
    description: 'Timestamp when the customer was created',
  })
  @CreateDateColumn()
  createdAt: Date;
}
