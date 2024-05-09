/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentOrderEntity } from '~/database/typeorm/entities/paymentOrder.entity';

@Injectable()
export class PaymentOrderRepository extends Repository<PaymentOrderEntity> {
    constructor(private dataSource: DataSource) {
        super(PaymentOrderEntity, dataSource.createEntityManager());
    }

    addPaymentOrderApprover(paymentOrderId: number, approverId: number): Promise<any> {
        return this.query(`
            INSERT INTO payment_order_approvers (payment_order_id, approver_id)
            SELECT ${paymentOrderId}, id FROM users WHERE id IN (${approverId})
            AND id NOT IN (SELECT approver_id FROM payment_order_approvers WHERE payment_order_id = ${paymentOrderId})
        `);
    }

    addAttachments(paymentOrderId: number, attachmentIds: number[]) {
        return this.createQueryBuilder('paymentOrder').relation(PaymentOrderEntity, 'attachments').of(paymentOrderId).add(attachmentIds);
    }

    removeAllAttachments(paymentOrderId: number) {
        return this.query(`DELETE FROM payment_orders_attachments WHERE payment_order_id = ${paymentOrderId}`);
    }
}
