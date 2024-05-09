import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { LEAVING_LATE_EARLY_STATUS } from '~/common/enums/enum';
import { UserEntity } from './user.entity';

@Entity({ name: 'leaving_late_early' })
export class LeavingLateEarlyEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'start_day', type: 'datetime', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'datetime', nullable: true })
    endDay: Date;

    @Column({ type: 'enum', enum: LEAVING_LATE_EARLY_STATUS, default: LEAVING_LATE_EARLY_STATUS.DRAFT })
    status: LEAVING_LATE_EARLY_STATUS;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

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
}
