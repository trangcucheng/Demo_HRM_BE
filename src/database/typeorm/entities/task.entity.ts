import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TASK_PRIORITY, TASK_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { DepartmentTaskEntity } from './departmentTask.entity';
import { UserEntity } from './user.entity';
import { MediaEntity } from './media.entity';

@Entity({ name: 'tasks' })
export class TaskEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 1000, nullable: true })
    description: string;

    @Column({ name: 'priority', type: 'varchar', length: 255, nullable: true })
    priority: TASK_PRIORITY;

    @Column({ name: 'due_date', type: 'date', nullable: true })
    dueDate: Date;

    @Column({ name: 'assignee_id', type: 'int', unsigned: true, nullable: true })
    assigneeId: number;

    @Column({ name: 'coordinator_id', type: 'int', unsigned: true, nullable: true })
    coordinatorId: number;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ name: 'comments', type: 'varchar', length: 1000, nullable: true })
    comments: string;

    @Column({ type: 'enum', enum: TASK_STATUS, default: TASK_STATUS.UNFINISHED })
    status: TASK_STATUS;

    @Column({ name: 'progress', type: 'int', unsigned: true, nullable: true })
    progress: number;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.assignedTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'assignee_id', referencedColumnName: 'id' })
    assignee: Relation<UserEntity>;

    @ManyToMany(() => MediaEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'tasks_attachments',
        joinColumn: { name: 'task_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' },
    })
    attachments: Relation<MediaEntity>[];

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.createdTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
    creator: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.coordinatedTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'coordinator_id', referencedColumnName: 'id' })
    coordinator: Relation<UserEntity>;

    @OneToMany(() => DepartmentTaskEntity, (entity: DepartmentTaskEntity) => entity.task, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    departmentTasks: Relation<DepartmentTaskEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;
}
