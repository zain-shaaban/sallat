import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('sallat_sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    sessionID: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'bigint' })
    startDate: number;

    @Column({ type: 'varchar' })
    color: string;

    @Column({ type: 'varchar' })
    driverID: string;
    
    @Column({ type: 'varchar' })
    vehicleNumber: string;

    @Column({ type: 'jsonb' })
    locations: any[];

    @Column({ type: 'bigint' })
    number: number;
}
