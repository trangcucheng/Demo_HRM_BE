/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CalendarEntity } from '~/database/typeorm/entities/calendar.entity';

@Injectable()
export class CalendarRepository extends Repository<CalendarEntity> {
    constructor(private dataSource: DataSource) {
        super(CalendarEntity, dataSource.createEntityManager());
    }

    addCalendarUser(calendarId: number, userIds: number[]): Promise<any> {
        return this.query(`
            INSERT INTO calendar_users (calendar_id, user_id)
            SELECT ${calendarId}, id FROM users WHERE id IN (${userIds.join(',')})
            AND id NOT IN (SELECT user_id FROM calendar_users WHERE calendar_id = ${calendarId})
        `);
    }

    removeCalendarUser(calendarId: number): Promise<any> {
        return this.query(`
            DELETE FROM calendar_users WHERE calendar_id = ${calendarId}
        `);
    }
}
