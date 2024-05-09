import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'free_timekeeping' })
export class FreeTimekeepingEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ name: 'supporting_documents', type: 'varchar', length: 255, nullable: true })
    supportingDocuments: string;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
    createdBy: number;

    @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
    updatedBy: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.freeTimekeepings, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
