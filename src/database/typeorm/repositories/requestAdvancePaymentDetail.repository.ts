/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RequestAdvancePaymentDetailEntity } from '~/database/typeorm/entities/requestAdvancePaymentDetail.entity';

@Injectable()
export class RequestAdvancePaymentDetailRepository extends Repository<RequestAdvancePaymentDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(RequestAdvancePaymentDetailEntity, dataSource.createEntityManager());
    }
}
