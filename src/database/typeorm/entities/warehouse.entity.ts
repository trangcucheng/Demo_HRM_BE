import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'warehouses' })
export class WarehouseEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
    parentId: number;

    @Column({ name: 'parent_path', type: 'varchar', length: 255, nullable: true })
    parentPath: string;

    @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
    departmentId: number;

    @Index('IDX_WAREHOUSE_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Index('IDX_WAREHOUSE_CODE', { fulltext: true })
    @Column({ name: 'code', type: 'varchar', length: 255, nullable: true })
    code: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'address', type: 'text', nullable: true })
    address: string;

    /* RELATIONS */
    @OneToMany(() => InventoryEntity, (inventory) => inventory.warehouse, { createForeignKeyConstraints: false })
    inventories: Relation<InventoryEntity>[];

    @OneToMany(() => ProductCategoryEntity, (category) => category.warehouse, { createForeignKeyConstraints: false })
    productCategories: Relation<ProductCategoryEntity>[];

    @ManyToOne(() => DepartmentEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'department_id', referencedColumnName: 'id' })
    department: Relation<DepartmentEntity>;
}
