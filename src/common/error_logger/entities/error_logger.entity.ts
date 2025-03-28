import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_error_logs')
export class ErrorLogger {
  @PrimaryGeneratedColumn()
  errorID: number;

  @Column('varchar')
  message: string;

  @Column({ type: 'text', nullable: true })
  stack: string;

  @CreateDateColumn()
  timestamp: Date;
}
