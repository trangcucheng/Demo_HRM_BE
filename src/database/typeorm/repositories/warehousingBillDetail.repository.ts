/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WarehousingBillDetailEntity } from '~/database/typeorm/entities/warehousingBillDetail.entity';

@Injectable()
export class WarehousingBillDetailRepository extends Repository<WarehousingBillDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(WarehousingBillDetailEntity, dataSource.createEntityManager());
    }
}
