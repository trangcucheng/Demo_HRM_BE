/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FoodVoucherDetailEntity } from '~/database/typeorm/entities/foodVoucherDetail.entity';

@Injectable()
export class FoodVoucherDetailRepository extends Repository<FoodVoucherDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(FoodVoucherDetailEntity, dataSource.createEntityManager());
    }
}
