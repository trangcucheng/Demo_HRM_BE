/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';

@Injectable()
export class ApprovalHistoryRepository extends Repository<ApprovalHistoryEntity> {
    constructor(private dataSource: DataSource) {
        super(ApprovalHistoryEntity, dataSource.createEntityManager());
    }

    async getNextStep(entity: string, entityId: number) {
        const res = await this.createQueryBuilder('approvalHistory')
            .select('MAX(approvalHistory.step)', 'nextStep')
            .where('approvalHistory.entity = :entity', { entity })
            .andWhere('approvalHistory.entityId = :entityId', { entityId })
            .getRawOne();

        return (Number(res.nextStep) || 0) + 1;
    }
}
