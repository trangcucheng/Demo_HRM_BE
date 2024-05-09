import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from '~/database/typeorm/entities/abstract.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { CalendarEntity } from './calendar.entity';
import { DepartmentTaskEntity } from './departmentTask.entity';
import { AssetEntity } from './asset.entity';
import { DocumentEntity } from './document.entity';
import { SendDocumentEntity } from './sendDocument.entity';
import { TextEmbryoEntity } from './textEmbryo.entity';
import { MediaEntity } from './media.entity';

@Entity({ name: 'departments' })
export class DepartmentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_DEPARTMENT_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 50, nullable: true })
    code: string;

    @Column({ name: 'abbreviation', type: 'varchar', length: 50, nullable: true })
    abbreviation: string;

    @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ name: 'head_of_department_id', type: 'int', unsigned: true, nullable: true })
    headOfDepartmentId: number;

    @Column({ name: 'media_id', type: 'int', unsigned: true, nullable: true })
    avatarId: number;

    @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
    parentId: number;

    /* RELATIONS */
    @OneToMany(() => UserEntity, (entity: UserEntity) => entity.department, { createForeignKeyConstraints: false })
    users: Relation<UserEntity>[];

    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.children, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
    parent: Relation<DepartmentEntity>;

    @ManyToOne(() => MediaEntity, (entity: MediaEntity) => entity.departments, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'media_id', referencedColumnName: 'id' })
    avatar: Relation<MediaEntity>;

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.id, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'head_of_department_id', referencedColumnName: 'id' })
    headOfDepartment: Relation<UserEntity>;

    @OneToMany(() => DepartmentEntity, (entity: DepartmentEntity) => entity.parent, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    children: Relation<DepartmentEntity>[];

    // @OneToMany(() => CalendarEntity, (entity: CalendarEntity) => entity.department, {
    //     nullable: true,
    //     createForeignKeyConstraints: false,
    // })
    // calendars: Relation<CalendarEntity>[];

    @OneToMany(() => DepartmentTaskEntity, (entity: DepartmentTaskEntity) => entity.department, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    departmentTasks: Relation<DepartmentTaskEntity>[];

    @OneToMany(() => AssetEntity, (entity: AssetEntity) => entity.department, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    assets: Relation<AssetEntity>[];

    @OneToMany(() => DocumentEntity, (entity: DocumentEntity) => entity.department, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    documents: Relation<DocumentEntity>[];

    @OneToMany(() => SendDocumentEntity, (entity: SendDocumentEntity) => entity.department, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    sendDocuments: Relation<SendDocumentEntity>[];

    @OneToMany(() => TextEmbryoEntity, (entity: TextEmbryoEntity) => entity.department, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    textEmbryos: Relation<TextEmbryoEntity>[];
}
