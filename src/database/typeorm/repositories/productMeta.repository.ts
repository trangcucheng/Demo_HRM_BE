/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductMetaEntity } from '~/database/typeorm/entities/productMeta.entity';

@Injectable()
export class ProductMetaRepository extends Repository<ProductMetaEntity> {
    constructor(private dataSource: DataSource) {
        super(ProductMetaEntity, dataSource.createEntityManager());
    }
}
