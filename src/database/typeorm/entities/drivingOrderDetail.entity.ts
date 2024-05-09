import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DrivingOrderEntity } from './drivingOrder.entity';

@Entity({ name: 'driving_order_detail' })
export class DrivingOrderDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'departure', type: 'varchar', length: 255, nullable: true })
    departure: string;

    @Column({ name: 'destination', type: 'varchar', length: 255, nullable: true })
    destination: string;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ name: 'vehicle', type: 'varchar', length: 255, nullable: true })
    vehicle: string;

    @Column({ name: 'driving_order_id', type: 'int', unsigned: true, nullable: true })
    drivingOrderId: number;

    /* RELATIONS */
    @ManyToOne(() => DrivingOrderEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'driving_order_id', referencedColumnName: 'id' })
    drivingOrder: Relation<DrivingOrderEntity>;
}
