import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { PROPOSAL_STATUS } from '~/common/enums/enum';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'proposals' })
export class ProposalEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ name: 'warehouse_id', type: 'int', unsigned: true, nullable: true })
    warehouseId: number;

    @Index('IDX_PROPOSAL_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
    type: string;

    @Column({ name: 'content', type: 'text', nullable: true })
    content: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'status', type: 'varchar', length: 255, default: PROPOSAL_STATUS.DRAFT })
    status: PROPOSAL_STATUS;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, (user) => user.proposals, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @OneToMany(() => ProposalDetailEntity, (entity) => entity.proposal, { createForeignKeyConstraints: false })
    details: Relation<ProposalDetailEntity>[];

    @ManyToOne(() => DepartmentEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;

    @ManyToOne(() => WarehouseEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
    warehouse: Relation<WarehouseEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;
}
