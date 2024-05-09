/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfirmPortalDetailEntity } from '~/database/typeorm/entities/confirmPortalDetail.entity';

@Injectable()
export class ConfirmPortalDetailRepository extends Repository<ConfirmPortalDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(ConfirmPortalDetailEntity, dataSource.createEntityManager());
    }
}
