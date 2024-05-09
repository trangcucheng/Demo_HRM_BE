/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackingLogEntity } from '~/database/typeorm/entities/trackingLog.entity';

@Injectable()
export class TrackingLogRepository extends Repository<TrackingLogEntity> {
    constructor(private dataSource: DataSource) {
        super(TrackingLogEntity, dataSource.createEntityManager());
    }
}
