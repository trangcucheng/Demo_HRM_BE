import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { FOOD_VOUCHER_STATUS } from '~/common/enums/enum';
import { DepartmentEntity } from './department.entity';
import { UserEntity } from './user.entity';
import { FoodVoucherDetailEntity } from './foodVoucherDetail.entity';

@Entity({ name: 'food_voucher' })
export class FoodVoucherEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'enum', enum: FOOD_VOUCHER_STATUS, default: FOOD_VOUCHER_STATUS.DRAFT })
    status: FOOD_VOUCHER_STATUS;

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

    @OneToMany(() => FoodVoucherDetailEntity, (entity) => entity.foodVoucher, { createForeignKeyConstraints: false })
    detail: Relation<FoodVoucherDetailEntity>[];
}
