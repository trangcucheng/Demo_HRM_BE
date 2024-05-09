import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DepartmentEntity } from './department.entity';
import { UserEntity } from './user.entity';
import { RiceCouponDetailEntity } from './riceCouponDetail.entity';
import { RICE_COUPON_STATUS } from '~/common/enums/enum';

@Entity({ name: 'rice_coupon' })
export class RiceCouponEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'enum', enum: RICE_COUPON_STATUS, default: RICE_COUPON_STATUS.DRAFT })
    status: RICE_COUPON_STATUS;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToOne(() => DepartmentEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;

    @OneToMany(() => RiceCouponDetailEntity, (entity) => entity.riceCoupon, { createForeignKeyConstraints: false })
    detail: Relation<RiceCouponDetailEntity>[];
}
