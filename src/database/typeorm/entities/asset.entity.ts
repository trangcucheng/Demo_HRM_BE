import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ASSET_STATUS } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { DepartmentEntity } from './department.entity';
import { ColumnNumericTransformer } from './transformer.entity';

@Entity({ name: 'assets' })
export class AssetEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'price', type: 'decimal', precision: 16, scale: 3, nullable: true, transformer: new ColumnNumericTransformer() })
    price: number;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Column({ type: 'enum', enum: ASSET_STATUS, default: ASSET_STATUS.ACTIVE })
    status: ASSET_STATUS;

    /* RELATION */
    @ManyToOne(() => DepartmentEntity, (entity: DepartmentEntity) => entity.assets, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;
}
