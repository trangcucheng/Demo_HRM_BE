/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RequestAdvancePaymentEntity } from '~/database/typeorm/entities/requestAdvancePayment.entity';

@Injectable()
export class RequestAdvancePaymentRepository extends Repository<RequestAdvancePaymentEntity> {
    constructor(private dataSource: DataSource) {
        super(RequestAdvancePaymentEntity, dataSource.createEntityManager());
    }

    addRequestAdvancePaymentApprover(requestAdvancePaymentId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO request_advance_payment_approvers (request_advance_payment_id, approver_id)
            SELECT ${requestAdvancePaymentId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM request_advance_payment_approvers WHERE request_advance_payment_id = ${requestAdvancePaymentId})
        `);
    }

    addAttachments(requestAdvancePaymentId: number, attachmentIds: number[]) {
        return this.createQueryBuilder('requestAdvancePayment')
            .relation(RequestAdvancePaymentEntity, 'attachments')
            .of(requestAdvancePaymentId)
            .add(attachmentIds);
    }

    removeAllAttachments(requestAdvancePaymentId: number) {
        return this.query(`DELETE FROM request_advance_payments_attachments WHERE request_advance_payment_id = ${requestAdvancePaymentId}`);
    }
}
