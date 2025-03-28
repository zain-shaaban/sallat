import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sallat_drivers')
export class Driver {
  @ApiProperty({
    type: 'string',
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @PrimaryGeneratedColumn('uuid')
  driverID: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @Column('varchar')
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column('varchar')
  name: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', unique: true })
  password: string;

  @ApiProperty({ type: 'string', example: '332211' })
  @Column({ type: 'varchar', nullable: true })
  assignedVehicleNumber: string;

  @ApiProperty({ type: 'number', example: 1500000.0 })
  @Column({ type: 'float', nullable: true })
  salary: number;

  @ApiProperty({ type: 'string', example: 'tokentokentokentokentoken' })
  @Column({ type: 'varchar', nullable: true })
  notificationToken: string;
}
