import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { PAYMENT_ORDER_STATUS } from '~/common/enums/enum';
import { MediaEntity } from './media.entity';

@Entity({ name: 'payment_order' })
export class PaymentOrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'money_number', type: 'varchar', length: 255, nullable: true })
    moneyNumber: string;

    @Column({ name: 'money_unit', type: 'varchar', length: 255, nullable: true })
    moneyUnit: string;

    @Column({ name: 'content', type: 'varchar', length: 1000, nullable: true })
    content: string;

    @Column({ type: 'enum', enum: PAYMENT_ORDER_STATUS, default: PAYMENT_ORDER_STATUS.DRAFT })
    status: PAYMENT_ORDER_STATUS;

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
        name: 'payment_orders_attachments',
        joinColumn: { name: 'payment_order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' },
    })
    attachments: Relation<MediaEntity>[];
}
