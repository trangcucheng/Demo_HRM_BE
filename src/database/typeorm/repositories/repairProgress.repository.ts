/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RepairProgressEntity } from '~/database/typeorm/entities/repairProgress.entity';

@Injectable()
export class RepairProgressRepository extends Repository<RepairProgressEntity> {
    constructor(private dataSource: DataSource) {
        super(RepairProgressEntity, dataSource.createEntityManager());
    }
}
