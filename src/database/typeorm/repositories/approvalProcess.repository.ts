/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApprovalProcessEntity } from '~/database/typeorm/entities/approvalProcess.entity';

@Injectable()
export class ApprovalProcessRepository extends Repository<ApprovalProcessEntity> {
    constructor(private dataSource: DataSource) {
        super(ApprovalProcessEntity, dataSource.createEntityManager());
    }
}
