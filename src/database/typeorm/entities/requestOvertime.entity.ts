import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DepartmentEntity } from './department.entity';
import { ShiftEntity } from './shift.entity';
import { REQUEST_OVERTIME_STATUS } from '~/common/enums/enum';
import { UserEntity } from './user.entity';
import { RequestOvertimeDetailEntity } from './requestOvertimeDetail.entity';

@Entity({ name: 'request_overtime' })
export class RequestOvertimeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ type: 'enum', enum: REQUEST_OVERTIME_STATUS, default: REQUEST_OVERTIME_STATUS.DRAFT })
    status: REQUEST_OVERTIME_STATUS;

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

    @OneToMany(() => RequestOvertimeDetailEntity, (entity) => entity.requestOvertime, { createForeignKeyConstraints: false })
    detail: Relation<RequestOvertimeDetailEntity>[];
}
