import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'order_progress_tracking' })
export class OrderProgressTrackingEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'order_id', type: 'int', unsigned: true, nullable: true })
    orderId: number;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string;

    @Column({ name: 'tracking_date', type: 'datetime', nullable: true })
    trackingDate: Date;

    /* RELATIONS */
    @ManyToOne(() => OrderEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
    order: Relation<OrderEntity>;
}
