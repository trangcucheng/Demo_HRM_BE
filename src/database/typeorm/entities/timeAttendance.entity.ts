import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TIME_ATTENDANCE_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'time_attendances' })
export class TimeAttendanceEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'date', type: 'date', nullable: true })
    date: Date;

    @Column({ name: 'time_in', type: 'datetime', nullable: true })
    timeIn: Date;

    @Column({ name: 'time_out', type: 'datetime', nullable: true })
    timeOut: Date;

    @Column({ name: 'total_hours', type: 'float', nullable: true })
    totalHours: number;

    @Column({ name: 'overtime_hours', type: 'float', nullable: true })
    overtimeHours: number;

    @Column({ name: 'absence_type', type: 'varchar', length: 255, nullable: true })
    absenceType: string;

    @Column({ name: 'absence_reason', type: 'varchar', length: 255, nullable: true })
    absenceReason: string;

    @Column({ name: 'supporting_documents', type: 'varchar', length: 255, nullable: true })
    supportingDocuments: string;

    @Column({ name: 'status', type: 'varchar', length: 255, nullable: true })
    status: TIME_ATTENDANCE_STATUS;

    @Column({ name: 'approver_date', type: 'date', nullable: true })
    approverDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
    createdBy: number;

    @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
    updatedBy: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.timeAttendances, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
