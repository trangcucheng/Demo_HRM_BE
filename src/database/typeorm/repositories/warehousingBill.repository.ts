/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';

@Injectable()
export class WarehousingBillRepository extends Repository<WarehousingBillEntity> {
    constructor(private dataSource: DataSource) {
        super(WarehousingBillEntity, dataSource.createEntityManager());
    }
}
