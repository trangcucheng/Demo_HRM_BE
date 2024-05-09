import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { DRIVING_ORDER_STATUS } from '~/common/enums/enum';
import { DrivingOrderDetailEntity } from './drivingOrderDetail.entity';

@Entity({ name: 'driving_order' })
export class DrivingOrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ type: 'enum', enum: DRIVING_ORDER_STATUS, default: DRIVING_ORDER_STATUS.DRAFT })
    status: DRIVING_ORDER_STATUS;

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

    @OneToMany(() => DrivingOrderDetailEntity, (entity) => entity.drivingOrder, { createForeignKeyConstraints: false })
    detail: Relation<DrivingOrderDetailEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;
}
