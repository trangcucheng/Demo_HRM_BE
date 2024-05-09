/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';

@Injectable()
export class ProposalDetailRepository extends Repository<ProposalDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(ProposalDetailEntity, dataSource.createEntityManager());
    }

    getDetailByProposalId(proposalId: number): Promise<{ productId: number; productName: string; quantity: number }[]> {
        return this.createQueryBuilder('proposalDetail')
            .leftJoin('proposalDetail.product', 'product')
            .select('proposalDetail.productId', 'productId')
            .addSelect('proposalDetail.quantity', 'quantity')
            .addSelect('product.name', 'productName')
            .where('proposalDetail.proposalId = :proposalId', { proposalId })
            .getRawMany();
    }
}
