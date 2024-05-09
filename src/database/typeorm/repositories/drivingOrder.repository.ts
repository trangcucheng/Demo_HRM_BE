/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DrivingOrderEntity } from '~/database/typeorm/entities/drivingOrder.entity';

@Injectable()
export class DrivingOrderRepository extends Repository<DrivingOrderEntity> {
    constructor(private dataSource: DataSource) {
        super(DrivingOrderEntity, dataSource.createEntityManager());
    }

    addDrivingOrderApprover(drivingOrderId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO driving_order_approvers (driving_order_id, approver_id)
            SELECT ${drivingOrderId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM driving_order_approvers WHERE driving_order_id = ${drivingOrderId})
        `);
    }
}
