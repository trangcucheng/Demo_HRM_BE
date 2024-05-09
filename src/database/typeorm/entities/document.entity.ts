import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DepartmentEntity } from './department.entity';
import { SendDocumentEntity } from './sendDocument.entity';

@Entity({ name: 'documents' })
export class DocumentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'link', type: 'varchar', length: 255, nullable: true })
    link: string;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    /* RELATION */
    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.documents, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;

    @OneToMany(() => SendDocumentEntity, (entity: SendDocumentEntity) => entity.document, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    sendDocuments: Relation<SendDocumentEntity>[];
}
