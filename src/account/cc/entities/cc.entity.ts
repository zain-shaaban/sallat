import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_cc', { orderBy: { createdAt: 'ASC' } })
export class Cc {
  @ApiProperty({
    type: 'string',
    example: '9ab58e3c-cb92-42b2-be1e-d2dfb31f817f',
  })
  @PrimaryGeneratedColumn('uuid')
  ccID: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column()
  name: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  @Exclude()
  password: string;

  @ApiProperty({ type: 'number', example: 1500000.0 })
  @Column({ type: 'float', nullable: true })
  salary: number;

  @CreateDateColumn()
  @Exclude()
  createAt: Date;
}
