import { PaymentRequestListEvent } from './../../payment-request-list/events/payment-request-list.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class PaymentRequestListListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('paymentRequestList.created')
    async handlePaymentRequestListCreatedEvent(event: PaymentRequestListEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/payment-request-list/${event.id}?status=true`,
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

    @OnEvent('paymentRequestList.pending')
    async handlePaymentRequestListPendingEvent(event: PaymentRequestListEvent) {
        const entity = await this.database.paymentRequestList.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('paymentRequestList:headApprove');
        this.notificationService.createNotification({
            entity: 'paymentRequestList',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'paymentRequestList',
            link: `/hrm/payment-request-list/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Bảng kê đề nghị thanh toán đang chờ phê duyệt`,
                    content: `Bảng kê đề nghị thanh toán đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Payment request list is pending approval`,
                    content: `Payment request list is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('paymentRequestList.approved')
    async handlePaymentRequestListApprovedEvent(event: PaymentRequestListEvent) {
        const entity = await this.database.paymentRequestList.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('paymentRequestList:create');

        this.notificationService.createNotification({
            entity: 'paymentRequestList',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'paymentRequestList',
            link: `/hrm/payment-request-list/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Bảng kê đề nghị thanh toán đã được phê duyệt`,
                    content: `Bảng kê đề nghị thanh toán đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Payment request list has been approved`,
                    content: `Payment request list has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('paymentRequestList.rejected')
    async handlePaymentRequestListRejectedEvent(event: PaymentRequestListEvent) {
        const entity = await this.database.paymentRequestList.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'paymentRequestList',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'paymentRequestList',
            link: `/hrm/payment-request-list/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Bảng kê đề nghị thanh toán đã bị từ chối`,
                    content: `Bảng kê đề nghị thanh toán đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Payment request list has been rejected`,
                    content: `Payment request list has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('paymentRequestList.forwarded')
    async handlePaymentRequestListForwardedEvent(event: PaymentRequestListEvent) {
        const entity = await this.database.paymentRequestList.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'paymentRequestList',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'paymentRequestList',
            link: `/hrm/payment-request-list/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Bảng kê đề nghị thanh toán đã được chuyển`,
                    content: `Bảng kê đề nghị thanh toán đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Payment request list has been forwarded`,
                    content: `Payment request list has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ສົ່ງຕໍ່`,
                    content: `ບັນຊີລາຍຊື່ການຮ້ອງຂໍການຈ່າຍເງິນ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
