import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TrackingLogEntity } from './trackingLog.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'tracking_log_detail' })
export class TrackingLogDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'enter_time', type: 'datetime', nullable: true })
    enterTime: Date;

    @Column({ name: 'exit_time', type: 'datetime', nullable: true })
    exitTime: Date;

    @Column({ name: 'content', type: 'varchar', length: 255, nullable: true })
    content: string;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'tracking_log_id', type: 'int', unsigned: true, nullable: true })
    trackingLogId: number;

    /* RELATIONS */
    @ManyToOne(() => TrackingLogEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'tracking_log_id', referencedColumnName: 'id' })
    trackingLog: Relation<TrackingLogEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<UserEntity>;
}
