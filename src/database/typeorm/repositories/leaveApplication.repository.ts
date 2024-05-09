/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LeaveApplicationEntity } from '../entities/leaveApplication.entity';

@Injectable()
export class LeaveApplicationRepository extends Repository<LeaveApplicationEntity> {
    constructor(private dataSource: DataSource) {
        super(LeaveApplicationEntity, dataSource.createEntityManager());
    }

    addLeaveApplicationApprover(leaveApplicationId: number, userId: number): Promise<any> {
        return this.query(`
            INSERT INTO leave_application_approvers (leave_application_id, approver_id)
            SELECT ${leaveApplicationId}, id FROM users WHERE id IN (${userId})
            AND id NOT IN (SELECT approver_id FROM leave_application_approvers WHERE leave_application_id = ${leaveApplicationId})
        `);
    }
}
