/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StocktakeDetailEntity } from '~/database/typeorm/entities/stocktakeDetail.entity';

@Injectable()
export class StocktakeDetailRepository extends Repository<StocktakeDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(StocktakeDetailEntity, dataSource.createEntityManager());
    }
}
