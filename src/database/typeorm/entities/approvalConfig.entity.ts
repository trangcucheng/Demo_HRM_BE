import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'approval_configs' })
export class ApprovalConfigEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'entity', type: 'varchar', length: 255, nullable: false })
    entity: string;

    @Column({ name: 'approver_id', type: 'int', unsigned: true, nullable: false })
    approverId: number;

    @Column({ name: 'to_status', type: 'varchar', length: 255, nullable: false })
    toStatus: string; // status that the entity should be in to trigger the approval process
}
