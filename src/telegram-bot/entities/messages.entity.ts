import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sallat_telegram_messages' })
export class TelegramMessage {
  @PrimaryGeneratedColumn('uuid')
  messageID: string;

  @Column()
  from: string;

  @Column()
  text: string;

  @Column()
  topicID: number;

  @CreateDateColumn()
  createdAt: Date;
}
