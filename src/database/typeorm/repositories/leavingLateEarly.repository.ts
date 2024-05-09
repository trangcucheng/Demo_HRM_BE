/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LeavingLateEarlyEntity } from '~/database/typeorm/entities/leavingLateEarly.entity';

@Injectable()
export class LeavingLateEarlyRepository extends Repository<LeavingLateEarlyEntity> {
    constructor(private dataSource: DataSource) {
        super(LeavingLateEarlyEntity, dataSource.createEntityManager());
    }
}
