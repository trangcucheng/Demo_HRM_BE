/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RepairDetailEntity } from '~/database/typeorm/entities/repairDetail.entity';

@Injectable()
export class RepairDetailRepository extends Repository<RepairDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(RepairDetailEntity, dataSource.createEntityManager());
    }

    getDetailByRequestId(requestId: number): Promise<{ productId: number; productName: string; quantity: number }[]> {
        return this.createQueryBuilder('requestDetail')
            .leftJoin('requestDetail.replacementPart', 'product')
            .select('requestDetail.replacementPartId', 'productId')
            .addSelect('requestDetail.quantity', 'quantity')
            .addSelect('product.name', 'productName')
            .where('requestDetail.repairRequestId = :requestId', { requestId })
            .getRawMany();
    }
}
