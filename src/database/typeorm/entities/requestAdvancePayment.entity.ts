import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { PAYMENT_ORDER_STATUS, REQUEST_ADVANCE_PAYMENT_STATUS } from '~/common/enums/enum';
import { RequestAdvancePaymentDetailEntity } from './requestAdvancePaymentDetail.entity';
import { MediaEntity } from './media.entity';

@Entity({ name: 'request_advance_payment' })
export class RequestAdvancePaymentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'money_total', type: 'varchar', length: 255, nullable: true })
    moneyTotal: string;

    @Column({ name: 'money_unit', type: 'varchar', length: 255, nullable: true })
    moneyUnit: string;

    @Column({ type: 'enum', enum: REQUEST_ADVANCE_PAYMENT_STATUS, default: REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT })
    status: REQUEST_ADVANCE_PAYMENT_STATUS;

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

    @ManyToMany(() => MediaEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'request_advance_payments_attachments',
        joinColumn: { name: 'request_advance_payment_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' },
    })
    attachments: Relation<MediaEntity>[];

    @OneToMany(() => RequestAdvancePaymentDetailEntity, (entity) => entity.requestAdvancePayment, { createForeignKeyConstraints: false })
    detail: Relation<RequestAdvancePaymentDetailEntity>[];
}
