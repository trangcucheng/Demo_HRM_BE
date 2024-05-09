/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuantityLimitEntity } from '~/database/typeorm/entities/quantityLimit.entity';

@Injectable()
export class QuantityLimitRepository extends Repository<QuantityLimitEntity> {
    constructor(private dataSource: DataSource) {
        super(QuantityLimitEntity, dataSource.createEntityManager());
    }
}
