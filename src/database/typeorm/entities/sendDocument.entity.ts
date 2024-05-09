import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DocumentEntity } from './document.entity';
import { DepartmentEntity } from './department.entity';

@Entity({ name: 'send_documents' })
export class SendDocumentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'document_id', type: 'int', unsigned: true, nullable: true })
    documentId: number;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    /* RELATION */
    @ManyToOne(() => DocumentEntity, (entity: DocumentEntity) => entity.sendDocuments, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'document_id', referencedColumnName: 'id' })
    document: Relation<DocumentEntity>;

    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.sendDocuments, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;
}
