import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ForgotCheckinOutEvent } from '~/modules/forgot-checkin-out/events/forgot_checkin_out.event';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class ForgotCheckinOutListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('forgotCheckinOut.created')
    async handleForgotCheckinOutCreatedEvent(event: ForgotCheckinOutEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/forgot-checkin-out/${event.id}?status=true`,
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

    @OnEvent('forgotCheckinOut.pending')
    async handleForgotCheckinOutPendingEvent(event: ForgotCheckinOutEvent) {
        const entity = await this.database.forgotCheckinOut.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('forgotCheckinOut:headApprove');
        this.notificationService.createNotification({
            entity: 'forgotCheckinOut',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'forgotCheckinOut',
            link: `/hrm/forgot-checkin-out/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn quên checkin/out đang chờ phê duyệt`,
                    content: `Đơn quên checkin/out đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Forgot to check in/out is pending approval`,
                    content: `Forgot to check in/out is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ລືມເຊັກອິນ/ອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ລືມເຊັກອິນ/ອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('forgotCheckinOut.approved')
    async handleForgotCheckinOutApprovedEvent(event: ForgotCheckinOutEvent) {
        const entity = await this.database.forgotCheckinOut.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('forgotCheckinOut:create');

        this.notificationService.createNotification({
            entity: 'forgotCheckinOut',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'forgotCheckinOut',
            link: `/hrm/forgot-checkin-out/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn quên checkin/out đã được phê duyệt`,
                    content: `Đơn quên checkin/out đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Forgot to check in/out has been approved`,
                    content: `Forgot to check in/out has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ລືມເຊັກອິນ/ອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ລືມເຊັກອິນ/ອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('forgotCheckinOut.rejected')
    async handleForgotCheckinOutRejectedEvent(event: ForgotCheckinOutEvent) {
        const entity = await this.database.forgotCheckinOut.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'forgotCheckinOut',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'forgotCheckinOut',
            link: `/hrm/forgot-checkin-out/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn quên checkin/out đã bị từ chối`,
                    content: `Đơn quên checkin/out đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Forgot to check in/out has been rejected`,
                    content: `Forgot to check in/out has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ລືມເຊັກອິນ/ອອກ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ລືມເຊັກອິນ/ອອກ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('forgotCheckinOut.forwarded')
    async handleForgotCheckinOutForwardedEvent(event: ForgotCheckinOutEvent) {
        const entity = await this.database.forgotCheckinOut.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'forgotCheckinOut',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'forgotCheckinOut',
            link: `/hrm/forgot-checkin-out/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn quên checkin/out đã được chuyển`,
                    content: `Đơn quên checkin/out đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Forgot to check in/out has been forwarded`,
                    content: `Forgot to check in/out has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ລືມເຊັກອິນ/ອອກ ສົ່ງຕໍ່`,
                    content: `ລືມເຊັກອິນ/ອອກ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
