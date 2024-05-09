import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { StocktakeEntity } from '~/database/typeorm/entities/stocktake.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'approval_processes' })
export class ApprovalProcessEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'proposal_id', type: 'int', unsigned: true, nullable: true })
    proposalId: number;

    @Column({ name: 'warehousing_bill_id', type: 'int', unsigned: true, nullable: true })
    warehousingBillId: number;

    @Column({ name: 'stocktake_id', type: 'int', unsigned: true, nullable: true })
    stocktakeId: number;

    @Column({ name: 'user_id', type: 'int', unsigned: true })
    userId: number;

    @Column({ name: 'from', type: 'varchar', length: 50 })
    from: string;

    @Column({ name: 'to', type: 'varchar', length: 50 })
    to: string;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string;

    /* RELATIONS */
    @ManyToOne(() => ProposalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'proposal_id', referencedColumnName: 'id' })
    proposal: Relation<ProposalEntity>;

    @ManyToOne(() => WarehousingBillEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehousing_bill_id', referencedColumnName: 'id' })
    warehousingBill: Relation<WarehousingBillEntity>;

    @ManyToOne(() => StocktakeEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'stocktake_id', referencedColumnName: 'id' })
    stocktake: Relation<StocktakeEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
