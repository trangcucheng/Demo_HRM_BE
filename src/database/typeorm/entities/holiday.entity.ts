import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'holidays' })
export class HolidayEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'title', type: 'varchar', length: 255, nullable: true, default: null })
    title: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'start_day', type: 'datetime', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'datetime', nullable: true })
    endDay: Date;

    @ManyToMany(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'holiday_users',
        joinColumn: { name: 'holiday_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    users: Relation<UserEntity>[];
}
