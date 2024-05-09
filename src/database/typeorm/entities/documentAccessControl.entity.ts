import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnArrayTransformer, ColumnBooleanTransformer } from '~/database/typeorm/entities/transformer.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'document_access_control' })
export class DocumentAccessControlEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ name: 'position_id', type: 'int', unsigned: true, nullable: true })
    positionId: number;

    @Column({ name: 'position_group_id', type: 'int', unsigned: true, nullable: true })
    positionGroupId: number;

    @Column({ name: 'entity', type: 'varchar', length: 255, nullable: true })
    entity: string;

    @Column({
        name: 'can_view_own_department',
        type: 'tinyint',
        transformer: new ColumnBooleanTransformer(),
        unsigned: true,
        nullable: true,
        default: 0,
    })
    canViewOwnDepartment: boolean;

    @Column({
        name: 'can_view_all_departments',
        type: 'tinyint',
        transformer: new ColumnBooleanTransformer(),
        unsigned: true,
        nullable: true,
        default: 0,
    })
    canViewAllDepartments: boolean;

    @Column({
        name: 'can_view_specific_department',
        type: 'tinyint',
        transformer: new ColumnBooleanTransformer(),
        unsigned: true,
        nullable: true,
        default: 0,
    })
    canViewSpecificDepartment: boolean;

    @Column({
        name: 'department_ids',
        type: 'longtext',
        nullable: true,
        transformer: new ColumnArrayTransformer('number'),
    })
    departmentIds: number[];
}
