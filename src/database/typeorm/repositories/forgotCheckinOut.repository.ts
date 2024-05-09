/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ForgotCheckinOutEntity } from '~/database/typeorm/entities/forgotCheckinOut.entity';

@Injectable()
export class ForgotCheckinOutRepository extends Repository<ForgotCheckinOutEntity> {
    constructor(private dataSource: DataSource) {
        super(ForgotCheckinOutEntity, dataSource.createEntityManager());
    }
}
