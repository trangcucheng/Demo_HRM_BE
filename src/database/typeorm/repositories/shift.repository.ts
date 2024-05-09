/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ShiftEntity } from '~/database/typeorm/entities/shift.entity';

@Injectable()
export class ShiftRepository extends Repository<ShiftEntity> {
    constructor(private dataSource: DataSource) {
        super(ShiftEntity, dataSource.createEntityManager());
    }
}
