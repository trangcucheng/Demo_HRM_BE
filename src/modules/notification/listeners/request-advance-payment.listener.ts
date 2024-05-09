import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { RequestAdvancePaymentEvent } from '~/modules/request-advance-payment/events/request-advance-payment.event';

@Injectable()
export class RequestAdvancePaymentListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('requestAdvancePayment.created')
    async handleRequestAdvancePaymentCreatedEvent(event: RequestAdvancePaymentEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/request-advance-payment/${event.id}?status=true`,
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

    @OnEvent('requestAdvancePayment.pending')
    async handleRequestAdvancePaymentPendingEvent(event: RequestAdvancePaymentEvent) {
        const entity = await this.database.requestAdvancePayment.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('requestAdvancePayment:headApprove');
        this.notificationService.createNotification({
            entity: 'requestAdvancePayment',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'requestAdvancePayment',
            link: `/hrm/request-advance-payment/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị tạm ứng đang chờ phê duyệt`,
                    content: `Đơn đề nghị tạm ứng đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Request advance payment is pending approval`,
                    content: `Request advance payment is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('requestAdvancePayment.approved')
    async handleRequestAdvancePaymentApprovedEvent(event: RequestAdvancePaymentEvent) {
        const entity = await this.database.requestAdvancePayment.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('requestAdvancePayment:create');

        this.notificationService.createNotification({
            entity: 'requestAdvancePayment',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'requestAdvancePayment',
            link: `/hrm/request-advance-payment/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị tạm ứng đã được phê duyệt`,
                    content: `Đơn đề nghị tạm ứng đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Request advance payment has been approved`,
                    content: `Request advance payment has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('requestAdvancePayment.rejected')
    async handleRequestAdvancePaymentRejectedEvent(event: RequestAdvancePaymentEvent) {
        const entity = await this.database.requestAdvancePayment.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'requestAdvancePayment',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'requestAdvancePayment',
            link: `/hrm/request-advance-payment/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị tạm ứng đã bị từ chối`,
                    content: `Đơn đề nghị tạm ứng đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Request advance payment has been rejected`,
                    content: `Request advance payment has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('requestAdvancePayment.forwarded')
    async handleRequestAdvancePaymentForwardedEvent(event: RequestAdvancePaymentEvent) {
        const entity = await this.database.requestAdvancePayment.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'requestAdvancePayment',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'requestAdvancePayment',
            link: `/hrm/request-advance-payment/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn đề nghị tạm ứng đã được chuyển`,
                    content: `Đơn đề nghị tạm ứng đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Request advance payment has been forwarded`,
                    content: `Request advance payment has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ສົ່ງຕໍ່`,
                    content: `ຄໍາ​ຮ້ອງ​ສະ​ຫມັກ​ສໍາ​ລັບ​ການ​ຊໍາ​ລະ​ລ່ວງ​ຫນ້າ​ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
