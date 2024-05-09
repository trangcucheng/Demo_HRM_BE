import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation, RelationId } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { LEVEL_CALENDAR } from '~/common/enums/enum';
import { UserEntity } from './user.entity';

@Entity({ name: 'calendars' })
export class CalendarEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ name: 'description', type: 'varchar', length: 1000, nullable: true })
    description: string;

    @Column({ name: 'start_date', type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime', nullable: true })
    endDate: Date;

    @Column({ type: 'enum', enum: LEVEL_CALENDAR, default: LEVEL_CALENDAR.LESS_IMPORTANT })
    level: LEVEL_CALENDAR;

    @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
    createdBy: number;

    @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
    updatedBy: number;

    @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
    location: string;

    @RelationId((calendar: CalendarEntity) => calendar.users)
    userIds: number[];

    @ManyToMany(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'calendar_users',
        joinColumn: { name: 'calendar_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    users: Relation<UserEntity>[];
}
