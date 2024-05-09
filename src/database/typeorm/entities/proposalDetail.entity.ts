import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, VirtualColumn } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'proposal_details' })
export class ProposalDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'proposal_id', type: 'int', unsigned: true, nullable: true })
    proposalId: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
    productId: number;

    @Column({
        name: 'quantity',
        type: 'decimal',
        precision: 12,
        scale: 2,
        unsigned: true,
        nullable: true,
        default: 0,
        transformer: new ColumnNumericTransformer(),
    })
    quantity: number;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    // 9,999,999,999,999.999
    @Column({ name: 'price', type: 'decimal', precision: 16, scale: 3, nullable: true, transformer: new ColumnNumericTransformer() })
    price: number;

    @VirtualColumn({ query: (alias) => `(${alias}.quantity * ${alias}.price)` })
    total: number;

    /* RELATIONS */
    @ManyToOne(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'proposal_id', referencedColumnName: 'id' })
    proposal: Relation<ProposalEntity>;

    @ManyToOne(() => ProductEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;
}
