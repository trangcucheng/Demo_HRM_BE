/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RequestOvertimeDetailEntity } from '~/database/typeorm/entities/requestOvertimeDetail.entity';

@Injectable()
export class RequestOvertimeDetailRepository extends Repository<RequestOvertimeDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(RequestOvertimeDetailEntity, dataSource.createEntityManager());
    }
}
