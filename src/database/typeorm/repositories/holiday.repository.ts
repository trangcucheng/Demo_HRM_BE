/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HolidayEntity } from '~/database/typeorm/entities/holiday.entity';

@Injectable()
export class HolidayRepository extends Repository<HolidayEntity> {
    constructor(private dataSource: DataSource) {
        super(HolidayEntity, dataSource.createEntityManager());
    }

    addUsers(holidayId: number, userIds: number[]) {
        return this.createQueryBuilder('holiday').relation(HolidayEntity, 'users').of(holidayId).add(userIds);
    }

    removeAllUser(holidayId: number) {
        return this.query(`DELETE FROM holiday_users WHERE holiday_id = ${holidayId}`);
    }
}
