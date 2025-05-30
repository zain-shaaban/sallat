import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriverMetadata } from './driverMetadata.entity';
import { AccountRole } from '../enums/account-role.enum';
import * as bcrypt from 'bcryptjs';

@Entity('sallat_accounts', { orderBy: { createdAt: 'ASC' } })
export class Account {
  @ApiProperty({
    type: 'string',
    example: '09eea85b-85d3-4d8a-8e41-a6a5af12c546',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  @Column()
  name: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ unique: true })
  password: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  @Column()
  phoneNumber: string;

  @ApiProperty({
    example: 'cc',
    required: true,
    enum: AccountRole,
    description: 'Account role in the system',
  })
  @Column({
    type: 'enum',
    enum: AccountRole,
  })
  role: AccountRole;

  @ApiProperty({ type: 'number', example: 1500000.0 })
  @Column({ type: 'float', nullable: true })
  salary: number;

  @OneToOne(() => DriverMetadata, (profile) => profile.account)
  driverMetadata: DriverMetadata;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @Exclude()
  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password)
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync());
  }
}
