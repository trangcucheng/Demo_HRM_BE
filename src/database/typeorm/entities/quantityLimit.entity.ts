import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'quantity_limits' })
export class QuantityLimitEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true })
    productId: number;

    @Column({ name: 'min_quantity', type: 'int', unsigned: true })
    minQuantity: number;

    @Column({ name: 'max_quantity', type: 'int', unsigned: true })
    maxQuantity: number;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    /* RELATIONS */
    @OneToOne(() => ProductEntity, (product) => product.quantityLimit, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;
}
