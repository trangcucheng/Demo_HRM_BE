import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'user_logs' })
export class UserLogEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'action', type: 'varchar', length: 255, nullable: true })
    action: string;

    @Column({ name: 'ip', type: 'varchar', length: 255, nullable: true })
    ip: string;

    @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
    userAgent: string;
}
