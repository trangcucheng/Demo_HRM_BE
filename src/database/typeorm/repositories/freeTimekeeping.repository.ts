/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FreeTimekeepingEntity } from '~/database/typeorm/entities/freeTimekeeping.entity';

@Injectable()
export class FreeTimekeepingRepository extends Repository<FreeTimekeepingEntity> {
    constructor(private dataSource: DataSource) {
        super(FreeTimekeepingEntity, dataSource.createEntityManager());
    }
}
