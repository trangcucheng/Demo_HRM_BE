/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RiceCouponDetailEntity } from '~/database/typeorm/entities/riceCouponDetail.entity';

@Injectable()
export class RiceCouponDetailRepository extends Repository<RiceCouponDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(RiceCouponDetailEntity, dataSource.createEntityManager());
    }
}
