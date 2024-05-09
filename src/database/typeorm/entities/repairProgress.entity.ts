import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'repair_progresses' })
export class RepairProgressEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'repair_request_id', type: 'int', unsigned: true, nullable: true })
    repairRequestId: number;

    @Column({ name: 'repair_by_id', type: 'int', unsigned: true, nullable: true })
    repairById: number;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string;

    @Column({ name: 'tracking_date', type: 'datetime', nullable: true })
    trackingDate: Date;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string;

    /* RELATIONS */
    @ManyToOne(() => RepairRequestEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_request_id', referencedColumnName: 'id' })
    repairRequest: Relation<RepairRequestEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_by_id', referencedColumnName: 'id' })
    repairBy: Relation<UserEntity>;
}
