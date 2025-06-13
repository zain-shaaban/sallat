import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_logs')
export class Log {
  @PrimaryGeneratedColumn()
  logID: number;

  @Column({ nullable: true })
  driverID: string;

  @Column()
  message: string;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
