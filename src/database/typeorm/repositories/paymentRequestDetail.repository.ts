/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentRequestDetailEntity } from '~/database/typeorm/entities/paymentRequestDetail.entity';

@Injectable()
export class PaymentRequestDetailRepository extends Repository<PaymentRequestDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(PaymentRequestDetailEntity, dataSource.createEntityManager());
    }
}
