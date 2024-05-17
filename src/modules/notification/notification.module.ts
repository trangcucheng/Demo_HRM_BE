import { Module } from '@nestjs/common';
import { CronJobListener } from '~/modules/notification/listeners/cronjob.listener';
import { InventoryListener } from '~/modules/notification/listeners/inventory.listener';
import { OrderListener } from '~/modules/notification/listeners/order.listener';
import { ProposalListener } from '~/modules/notification/listeners/proposal.listener';
import { WarehousingBillListener } from '~/modules/notification/listeners/warehousing-bill.listener';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PaymentRequestListListener } from '~/modules/notification/listeners/payment-request-list.listener';
import { PaymentOrderListener } from '~/modules/notification/listeners/payment-order.listener';
import { RequestAdvancePaymentListener } from '~/modules/notification/listeners/request-advance-payment.listener';
import { RequestOvertimeListener } from '~/modules/notification/listeners/request-overtime.listener';
import { TravelPaperListener } from '~/modules/notification/listeners/travel-paper.listener';
import { ConfirmPortalListener } from '~/modules/notification/listeners/confirm-portal.listener';
import { DrivingOrderListener } from './listeners/driving-order.listener';
import { LeaveApplicationListener } from './listeners/leave-application.listener';
import { LeavingLateEarlyEvent } from '../leaving-late-early/events/leaving-late-early.event';

import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '~/modules/notification/model/notification.model';

@Module({
    imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        ProposalListener,
        WarehousingBillListener,
        OrderListener,
        CronJobListener,
        InventoryListener,
        PaymentRequestListListener,
        PaymentOrderListener,
        RequestAdvancePaymentListener,
        RequestOvertimeListener,
        TravelPaperListener,
        ConfirmPortalListener,
        DrivingOrderListener,
        LeaveApplicationListener,
        LeavingLateEarlyEvent,
        // Notification,
    ],
})
export class NotificationModule { }
