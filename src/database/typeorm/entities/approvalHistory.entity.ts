import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'approval_history' })
export class ApprovalHistoryEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'entity', type: 'varchar', length: 255, nullable: true })
    entity: string;

    @Column({ name: 'entity_id', type: 'int', unsigned: true, nullable: true })
    entityId: number;

    @Column({ name: 'approver_id', type: 'int', unsigned: true, nullable: true })
    approverId: number;

    @Column({ name: 'step', type: 'smallint', unsigned: true, nullable: true })
    step: number;

    @Column({ name: 'action', type: 'varchar', length: 255, nullable: true })
    action: string;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string;

    @Column({ name: 'status', type: 'varchar', length: 255, nullable: true })
    status: string;

    @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
    submittedAt: Date;
}
