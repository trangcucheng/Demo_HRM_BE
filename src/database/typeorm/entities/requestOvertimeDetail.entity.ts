import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { RequestOvertimeEntity } from './requestOvertime.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'request_overtime_detail' })
export class RequestOvertimeDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'start_time', type: 'datetime', nullable: true })
    startTime: Date;

    @Column({ name: 'end_time', type: 'datetime', nullable: true })
    endTime: Date;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'request_overtime_id', type: 'int', unsigned: true, nullable: true })
    requestOvertimeId: number;

    /* RELATIONS */
    @ManyToOne(() => RequestOvertimeEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'request_overtime_id', referencedColumnName: 'id' })
    requestOvertime: Relation<RequestOvertimeEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<UserEntity>;
}
