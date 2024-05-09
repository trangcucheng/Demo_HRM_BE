import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { PaymentRequestListEntity } from './paymentRequestList.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'payment_request_detail' })
export class PaymentRequestDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'spending_day', type: 'date', nullable: true })
    spendingDay: Date;

    @Column({ name: 'content', type: 'varchar', length: 255, nullable: true })
    content: string;

    @Column({ name: 'money', type: 'varchar', length: 255, nullable: true })
    money: string;

    @Column({ name: 'money_unit', type: 'varchar', length: 255, nullable: true })
    moneyUnit: string;

    @Column({ name: 'comment', type: 'varchar', length: 255, nullable: true })
    comment: string;

    @Column({ name: 'payment_request_list_id', type: 'int', unsigned: true, nullable: true })
    paymentRequestListId: number;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => PaymentRequestListEntity, (entity) => entity.detail, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'payment_request_list_id', referencedColumnName: 'id' })
    paymentRequestList: Relation<PaymentRequestListEntity>;
}
