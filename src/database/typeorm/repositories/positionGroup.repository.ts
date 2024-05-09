/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PositionGroupEntity } from '~/database/typeorm/entities/positionGroup.entity';

@Injectable()
export class PositionGroupRepository extends Repository<PositionGroupEntity> {
    constructor(private dataSource: DataSource) {
        super(PositionGroupEntity, dataSource.createEntityManager());
    }
}
