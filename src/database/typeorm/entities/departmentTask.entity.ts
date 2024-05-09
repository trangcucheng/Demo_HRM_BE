import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TaskEntity } from './task.entity';
import { DepartmentEntity } from './department.entity';

@Entity({ name: 'department_tasks' })
export class DepartmentTaskEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'task_id', type: 'int', unsigned: true, nullable: true })
    taskId: number;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ name: 'status', type: 'int', nullable: true })
    status: number;

    /* RELATION */
    @ManyToOne(() => TaskEntity, (entity: TaskEntity) => entity.departmentTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    task: Relation<TaskEntity>;

    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.departmentTasks, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;
}
