import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { PaymentOrderEvent } from '~/modules/payment-order/events/payment-order.event';

@Injectable()
export class PaymentOrderListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('paymentOrder.created')
    async handlePaymentOrderCreatedEvent(event: PaymentOrderEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/payment-order/${event.id}?status=true`,
        //         details: [
        //             {
        //                 lang: 'vi',
        //                 title: `Yêu cầu '${entity.name}' đã được tạo`,
        //                 content: `Yêu cầu '${entity.name}' đã được tạo`,
        //             },
        //             {
        //                 lang: 'en',
        //                 title: `Proposal '${entity.name}' has been created`,
        //                 content: `Proposal '${entity.name}' has been created`,
        //             },
        //             {
        //                 lang: 'lo',
        //                 title: `ຄຳປະກາດ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
        //                 content: `ຄຳປະກາດ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
        //             },
        //         ],
        //     });
        // }
    }

    @OnEvent('paymentOrder.pending')
    async handlePaymentOrderPendingEvent(event: PaymentOrderEvent) {
        const entity = await this.database.paymentOrder.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('paymentOrder:headApprove');
        this.notificationService.createNotification({
            entity: 'paymentOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'paymentOrder',
            link: `/hrm/payment-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị thanh toán đang chờ phê duyệt`,
                    content: `Đơn đề nghị thanh toán đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Payment order is pending approval`,
                    content: `Payment order is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('paymentOrder.approved')
    async handlePaymentOrderApprovedEvent(event: PaymentOrderEvent) {
        const entity = await this.database.paymentOrder.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('paymentOrder:create');

        this.notificationService.createNotification({
            entity: 'paymentOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'paymentOrder',
            link: `/hrm/payment-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị thanh toán đã được phê duyệt`,
                    content: `Đơn đề nghị thanh toán đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Payment order has been approved`,
                    content: `Payment order has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('paymentOrder.rejected')
    async handlePaymentOrderRejectedEvent(event: PaymentOrderEvent) {
        const entity = await this.database.paymentOrder.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'paymentOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'paymentOrder',
            link: `/hrm/payment-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị thanh toán đã bị từ chối`,
                    content: `Đơn đề nghị thanh toán đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Payment order has been rejected`,
                    content: `Payment order has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('paymentOrder.forwarded')
    async handlePaymentOrderForwardedEvent(event: PaymentOrderEvent) {
        const entity = await this.database.paymentOrder.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'paymentOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'paymentOrder',
            link: `/hrm/payment-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị thanh toán đã được chuyển`,
                    content: `Đơn đề nghị thanh toán đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Payment order has been forwarded`,
                    content: `Payment order has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ສົ່ງຕໍ່`,
                    content: `ແບບຟອມການຮ້ອງຂໍການຈ່າຍເງິນ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
