import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TRACKING_LOG_STATUS } from '~/common/enums/enum';
import { UserEntity } from './user.entity';
import { TrackingLogDetailEntity } from './trackingLogDetail.entity';

@Entity({ name: 'tracking_log' })
export class TrackingLogEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'enum', enum: TRACKING_LOG_STATUS, default: TRACKING_LOG_STATUS.DRAFT })
    status: TRACKING_LOG_STATUS;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;

    @OneToMany(() => TrackingLogDetailEntity, (entity) => entity.trackingLog, { createForeignKeyConstraints: false })
    detail: Relation<TrackingLogDetailEntity>[];
}
