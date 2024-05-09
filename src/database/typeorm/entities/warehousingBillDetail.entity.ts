import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'warehousing_bill_details' })
export class WarehousingBillDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'warehousing_bill_id', type: 'int', unsigned: true, nullable: true })
    warehousingBillId: number;

    @Column({ name: 'product_id', type: 'int', unsigned: true, nullable: true })
    productId: number;

    @Column({
        name: 'proposal_quantity',
        type: 'decimal',
        precision: 12,
        scale: 2,
        unsigned: true,
        nullable: true,
        transformer: new ColumnNumericTransformer(),
    })
    proposalQuantity: number;

    @Column({
        name: 'actual_quantity',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: new ColumnNumericTransformer(),
    })
    actualQuantity: number;

    /* RELATIONS */

    @ManyToOne(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'proposal_id', referencedColumnName: 'id' })
    proposal: Relation<ProposalEntity>;

    @ManyToOne(() => WarehousingBillEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehousing_bill_id', referencedColumnName: 'id' })
    warehousingBill: Relation<WarehousingBillEntity>;

    @ManyToOne(() => ProductEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Relation<ProductEntity>;
}
