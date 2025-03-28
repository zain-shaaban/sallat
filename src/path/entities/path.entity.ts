import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sallat_path')
export class Path {
  @PrimaryGeneratedColumn('uuid')
  pathID: string;

  @Column({
    type: 'jsonb',
  })
  path: string;

  @Column('bigint')
  date: number;
}
