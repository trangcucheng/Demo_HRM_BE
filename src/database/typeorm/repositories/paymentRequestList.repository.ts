/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentRequestListEntity } from '~/database/typeorm/entities/paymentRequestList.entity';

@Injectable()
export class PaymentRequestListRepository extends Repository<PaymentRequestListEntity> {
    constructor(private dataSource: DataSource) {
        super(PaymentRequestListEntity, dataSource.createEntityManager());
    }

    addPaymentRequestListApprover(paymentRequestListId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO payment_request_list_approvers (payment_request_list_id, approver_id)
            SELECT ${paymentRequestListId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM payment_request_list_approvers WHERE payment_request_list_id = ${paymentRequestListId})
        `);
    }

    addAttachments(paymentRequestListId: number, attachmentIds: number[]) {
        return this.createQueryBuilder('paymentRequestList')
            .relation(PaymentRequestListEntity, 'attachments')
            .of(paymentRequestListId)
            .add(attachmentIds);
    }

    removeAllAttachments(paymentRequestListId: number) {
        return this.query(`DELETE FROM payment_request_lists_attachments WHERE payment_request_list_id = ${paymentRequestListId}`);
    }
}
