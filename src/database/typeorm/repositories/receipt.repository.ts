/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReceiptEntity } from '~/database/typeorm/entities/receipt.entity';

@Injectable()
export class ReceiptRepository extends Repository<ReceiptEntity> {
    constructor(private dataSource: DataSource) {
        super(ReceiptEntity, dataSource.createEntityManager());
    }
}
