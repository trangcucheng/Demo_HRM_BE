/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLogEntity } from '~/database/typeorm/entities/userLog.entity';

@Injectable()
export class UserLogRepository extends Repository<UserLogEntity> {
    constructor(private dataSource: DataSource) {
        super(UserLogEntity, dataSource.createEntityManager());
    }
}
