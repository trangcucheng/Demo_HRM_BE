import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, VirtualColumn } from 'typeorm';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'order_items' })
export class OrderItemEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'order_id', type: 'int', unsigned: true, nullable: true })
    orderId: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
    productId: number;

    // 9999999999.99
    @Column({
        name: 'quantity',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        unsigned: true,
        default: 0,
        transformer: new ColumnNumericTransformer(),
    })
    quantity: number;

    // 9,999,999,999,999.999
    @Column({ name: 'price', type: 'decimal', precision: 16, scale: 3, nullable: true, transformer: new ColumnNumericTransformer() })
    price: number;

    @VirtualColumn({ query: (alias) => `(${alias}.quantity * ${alias}.price)` })
    total: number;

    /* RELATIONS */
    @ManyToOne(() => OrderEntity, (entity) => entity.items, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
    order: Relation<OrderEntity>;

    @ManyToOne(() => ProductEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;
}
