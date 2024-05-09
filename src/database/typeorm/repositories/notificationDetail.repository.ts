/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationDetailEntity } from '~/database/typeorm/entities/notificationDetail.entity';

@Injectable()
export class NotificationDetailRepository extends Repository<NotificationDetailEntity> {
    constructor(private dataSource: DataSource) {
        super(NotificationDetailEntity, dataSource.createEntityManager());
    }
}
