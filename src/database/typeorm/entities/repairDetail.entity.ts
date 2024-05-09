import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { ColumnNumericTransformer } from '~/database/typeorm/entities/transformer.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'repair_details' })
export class RepairDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'repair_request_id', type: 'int', unsigned: true, nullable: true })
    repairRequestId: number;

    @Column({ name: 'broken_part', type: 'varchar', length: 255, nullable: true })
    brokenPart: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'replacement_part_id', type: 'int', unsigned: true, nullable: true })
    replacementPartId: number;

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

    /* RELATIONS */
    @ManyToOne(() => ProductEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'replacement_part_id', referencedColumnName: 'id' })
    replacementPart: Relation<ProductEntity>;

    @ManyToOne(() => RepairRequestEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_request_id', referencedColumnName: 'id' })
    repairRequest: Relation<RepairRequestEntity>;
}
