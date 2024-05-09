import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'inventory_histories' })
export class InventoryHistoryEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'inventory_id', type: 'int', unsigned: true, nullable: true })
    inventoryId: number;

    @Column({ name: 'warehouse_id', type: 'int', unsigned: true, nullable: true })
    warehouseId: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
    productId: number;

    @Column({ name: 'from', type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: new ColumnNumericTransformer() })
    from: number;

    @Column({ name: 'to', type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: new ColumnNumericTransformer() })
    to: number;

    @Column({ name: 'change', type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: new ColumnNumericTransformer() })
    change: number;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
    type: string;

    /* RELATIONS */
    @ManyToOne(() => InventoryEntity, (entity) => entity.histories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'inventory_id', referencedColumnName: 'id' })
    inventory: Relation<InventoryEntity>;

    @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.inventories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
    warehouse: Relation<WarehouseEntity>;

    @ManyToOne(() => ProductEntity, (product) => product.inventories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;

    @ManyToOne(() => UserEntity, (entity) => entity.invetoryHistories, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;
}
