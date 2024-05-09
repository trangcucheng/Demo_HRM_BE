/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApprovalConfigEntity } from '~/database/typeorm/entities/approvalConfig.entity';

@Injectable()
export class ApprovalConfigRepository extends Repository<ApprovalConfigEntity> {
    constructor(private dataSource: DataSource) {
        super(ApprovalConfigEntity, dataSource.createEntityManager());
    }

    getConfig(data: { entity: string; approverId: number; toStatus?: string }): Promise<ApprovalConfigEntity> {
        return this.findOneBy(data);
    }
}
