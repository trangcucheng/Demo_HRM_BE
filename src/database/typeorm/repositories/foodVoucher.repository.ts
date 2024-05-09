/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FoodVoucherEntity } from '~/database/typeorm/entities/foodVoucher.entity';

@Injectable()
export class FoodVoucherRepository extends Repository<FoodVoucherEntity> {
    constructor(private dataSource: DataSource) {
        super(FoodVoucherEntity, dataSource.createEntityManager());
    }
}
