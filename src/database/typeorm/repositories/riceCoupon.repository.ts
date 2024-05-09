/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RiceCouponEntity } from '~/database/typeorm/entities/riceCoupon.entity';

@Injectable()
export class RiceCouponRepository extends Repository<RiceCouponEntity> {
    constructor(private dataSource: DataSource) {
        super(RiceCouponEntity, dataSource.createEntityManager());
    }
}
