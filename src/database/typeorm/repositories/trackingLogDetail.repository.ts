/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackingLogDetailEntity } from '~/database/typeorm/entities/trackingLogDetail.entity';

@Injectable()
export class TrackingLogDetailRepository extends Repository<TrackingLogDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(TrackingLogDetailEntity, dataSource.createEntityManager());
    }
}
