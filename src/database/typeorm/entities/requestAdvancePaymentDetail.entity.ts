import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { PAYMENT_ORDER_STATUS, REQUEST_ADVANCE_PAYMENT_STATUS } from '~/common/enums/enum';
import { RequestAdvancePaymentEntity } from './requestAdvancePayment.entity';

@Entity({ name: 'request_advance_payment_detail' })
export class RequestAdvancePaymentDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'content', type: 'varchar', length: 255, nullable: true })
    content: string;

    @Column({ name: 'unit', type: 'varchar', length: 255, nullable: true })
    unit: string;

    @Column({ name: 'quantity', type: 'int', unsigned: true, nullable: true })
    quantity: number;

    @Column({ name: 'unit_price', type: 'varchar', length: 255, nullable: true })
    unitPrice: string;

    @Column({ name: 'money_unit', type: 'varchar', length: 255, nullable: true })
    moneyUnit: string;

    @Column({ name: 'money_total', type: 'varchar', length: 255, nullable: true })
    moneyTotal: string;

    @Column({ name: 'request_advance_payment_id', type: 'int', unsigned: true, nullable: true })
    requestAdvancePaymentId: number;

    /* RELATIONS */
    @ManyToOne(() => RequestAdvancePaymentEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'request_advance_payment_id', referencedColumnName: 'id' })
    requestAdvancePayment: Relation<RequestAdvancePaymentEntity>;
}
