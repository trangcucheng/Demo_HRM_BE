import {
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    RelationId,
} from 'typeorm';
import { ORDER_STATUS } from '~/common/enums/enum';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'orders' })
export class OrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @RelationId((order: OrderEntity) => order.proposals)
    proposalIds: number[];

    @RelationId((order: OrderEntity) => order.repairRequests)
    repairRequestIds: number[];

    @Column({ name: 'warehouse_id', type: 'int', unsigned: true, nullable: true })
    warehouseId: number;

    @Index('IDX_ORDER_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Index('IDX_ORDER_CODE', { fulltext: true })
    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
    type: string;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true, default: ORDER_STATUS.PENDING })
    status: string;

    @Column({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true })
    estimatedDeliveryDate: Date;

    @Column({ name: 'provider', type: 'text', nullable: true, default: null })
    provider: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'note', type: 'text', nullable: true, default: null })
    note: string;

    @Column({ name: 'comment', type: 'text', nullable: true, default: null })
    comment: string;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToMany(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'orders_proposals',
        joinColumn: { name: 'order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'proposal_id', referencedColumnName: 'id' },
    })
    proposals: Relation<ProposalEntity>[];

    @ManyToMany(() => RepairRequestEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'orders_repair_requests',
        joinColumn: { name: 'order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'repair_request_id', referencedColumnName: 'id' },
    })
    repairRequests: Relation<RepairRequestEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @OneToMany(() => OrderItemEntity, (entity) => entity.order, { createForeignKeyConstraints: false })
    items: Relation<OrderItemEntity>[];

    @OneToMany(() => OrderProgressTrackingEntity, (entity) => entity.order, { createForeignKeyConstraints: false })
    progresses: Relation<OrderProgressTrackingEntity>[];

    @ManyToOne(() => WarehouseEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
    warehouse: Relation<WarehouseEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;
}
