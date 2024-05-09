/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TimeAttendanceEntity } from '~/database/typeorm/entities/timeAttendance.entity';

@Injectable()
export class TimeAttendanceRepository extends Repository<TimeAttendanceEntity> {
    constructor(private dataSource: DataSource) {
        super(TimeAttendanceEntity, dataSource.createEntityManager());
    }
}
