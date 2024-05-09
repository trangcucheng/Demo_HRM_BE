import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { WAREHOUSING_BILL_STATUS, WAREHOUSING_BILL_TYPE } from '~/common/enums/enum';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehousingBillDetailEntity } from '~/database/typeorm/entities/warehousingBillDetail.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'warehousing_bills' })
export class WarehousingBillEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'proposal_id', type: 'int', unsigned: true, nullable: true })
    proposalId: number;

    @Column({ name: 'order_id', type: 'int', unsigned: true, nullable: true })
    orderId: number;

    @Column({ name: 'repair_request_id', type: 'int', unsigned: true, nullable: true })
    repairRequestId: number;

    @Column({ name: 'warehouse_id', type: 'int', unsigned: true, nullable: true })
    warehouseId: number;

    @Column({ name: 'type', type: 'varchar', length: 50 })
    type: WAREHOUSING_BILL_TYPE;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 50, nullable: true })
    code: string;

    @Column({ name: 'status', type: 'varchar', length: 50, default: WAREHOUSING_BILL_STATUS.PENDING })
    status: WAREHOUSING_BILL_STATUS;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    /* RELATIONS */
    @OneToOne(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'proposal_id', referencedColumnName: 'id' })
    proposal: Relation<ProposalEntity>;

    @OneToOne(() => OrderEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
    order: Relation<OrderEntity>;

    @OneToOne(() => RepairRequestEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_request_id', referencedColumnName: 'id' })
    repairRequest: Relation<RepairRequestEntity>;

    @ManyToOne(() => WarehouseEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
    warehouse: Relation<WarehouseEntity>;

    @ManyToOne(() => UserEntity, (user) => user.warehousingBills, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @OneToMany(() => WarehousingBillDetailEntity, (warehousingBillDetail) => warehousingBillDetail.warehousingBill, {
        createForeignKeyConstraints: false,
    })
    details: Relation<WarehousingBillDetailEntity>[];
}
