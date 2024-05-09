/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RequestOvertimeEntity } from '~/database/typeorm/entities/requestOvertime.entity';

@Injectable()
export class RequestOvertimeRepository extends Repository<RequestOvertimeEntity> {
    constructor(private dataSource: DataSource) {
        super(RequestOvertimeEntity, dataSource.createEntityManager());
    }

    addRequestOvertimeApprover(requestOvertimeId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO request_overtime_approvers (request_overtime_id, approver_id)
            SELECT ${requestOvertimeId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM request_overtime_approvers WHERE request_overtime_id = ${requestOvertimeId})
        `);
    }
}
