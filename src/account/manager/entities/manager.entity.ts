import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sallat_managers')
export class Manager {
  @ApiProperty({ type: 'string', example: '09eea85b-85d3-4d8a-8e41-a6a5af12c546' })
  @PrimaryGeneratedColumn('uuid')
  managerID: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column()
  name: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', unique: true })
  password: string;

  @ApiProperty({ type: 'number', example: 1500000.0 })
  @Column({ type: 'float', nullable: true })
  salary: number;

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: 'boolean', default: false })
  superAdmin: boolean;
}
