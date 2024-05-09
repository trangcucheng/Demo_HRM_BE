import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { StocktakeEntity } from '~/database/typeorm/entities/stocktake.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'stocktake_details' })
export class StocktakeDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'stocktake_id', type: 'int', unsigned: true, nullable: true })
    stocktakeId: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
    productId: number;

    @Column({
        name: 'opening_quantity',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer(),
    })
    openingQuantity: number; // tồn đầu kỳ

    @Column({
        name: 'counted_quantity',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer(),
    })
    countedQuantity: number;

    @Column({
        name: 'quantity_difference',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer(),
    })
    quantityDifference: number;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    /* RELATIONS */
    @ManyToOne(() => StocktakeEntity, (entity) => entity.details, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'stocktake_id', referencedColumnName: 'id' })
    stocktake: Relation<StocktakeEntity>;

    @ManyToOne(() => ProductEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;
}
