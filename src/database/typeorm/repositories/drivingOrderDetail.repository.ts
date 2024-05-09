/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DrivingOrderDetailEntity } from '~/database/typeorm/entities/drivingOrderDetail.entity';

@Injectable()
export class DrivingOrderDetailRepository extends Repository<DrivingOrderDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(DrivingOrderDetailEntity, dataSource.createEntityManager());
    }
}
