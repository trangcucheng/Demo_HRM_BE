import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'disciplines' })
export class DisciplineEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'content', type: 'varchar', length: 1000, nullable: true })
    content: string;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'form_of_discipline', type: 'varchar', length: 255, nullable: true })
    formOfDiscipline: string;

    @Column({ name: 'decision_day', type: 'date', nullable: true })
    decisionDay: Date;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.disciplines, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
