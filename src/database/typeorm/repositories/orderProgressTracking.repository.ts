/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';

@Injectable()
export class OrderProgressTrackingRepository extends Repository<OrderProgressTrackingEntity> {
    constructor(private dataSource: DataSource) {
        super(OrderProgressTrackingEntity, dataSource.createEntityManager());
    }
}
