import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sallat_notifications')
export class NotificationSocket {
  @PrimaryGeneratedColumn('uuid')
  notificationID: string;

  @Column({ type: 'varchar' })
  type: string;

  @CreateDateColumn({ type: 'timestamptz' })
  date: Date;

  @Column({ type: 'jsonb' })
  data: any;
}
