import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { LeavingLateEarlyEvent } from '~/modules/leaving-late-early/events/leaving-late-early.event';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class LeavingLateEarlyListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('leavingLateEarly.created')
    async handleLeavingLateEarlyCreatedEvent(event: LeavingLateEarlyEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/leaving-late-early/${event.id}?status=true`,
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

    @OnEvent('leavingLateEarly.pending')
    async handleLeavingLateEarlyPendingEvent(event: LeavingLateEarlyEvent) {
        const entity = await this.database.leavingLateEarly.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('leavingLateEarly:headApprove');
        this.notificationService.createNotification({
            entity: 'leavingLateEarly',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'leavingLateEarly',
            link: `/hrm/leaving-late-early/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin đi muộn, về sớm đang chờ phê duyệt`,
                    content: `Đơn xin đi muộn, về sớm đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Application for leaving late and leaving early is pending approval`,
                    content: `Application for leaving late and leaving early is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('leavingLateEarly.approved')
    async handleLeavingLateEarlyApprovedEvent(event: LeavingLateEarlyEvent) {
        const entity = await this.database.leavingLateEarly.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('leavingLateEarly:create');

        this.notificationService.createNotification({
            entity: 'leavingLateEarly',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'leavingLateEarly',
            link: `/hrm/leaving-late-early/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin đi muộn, về sớm đã được phê duyệt`,
                    content: `Đơn xin đi muộn, về sớm đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Application for leaving late and leaving early has been approved`,
                    content: `Application for leaving late and leaving early has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('leavingLateEarly.rejected')
    async handleLeavingLateEarlyRejectedEvent(event: LeavingLateEarlyEvent) {
        const entity = await this.database.leavingLateEarly.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'leavingLateEarly',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'leavingLateEarly',
            link: `/hrm/leaving-late-early/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin đi muộn, về sớm đã bị từ chối`,
                    content: `Đơn xin đi muộn, về sớm đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Application for leaving late and leaving early has been rejected`,
                    content: `Application for leaving late and leaving early has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('leavingLateEarly.forwarded')
    async handleLeavingLateEarlyForwardedEvent(event: LeavingLateEarlyEvent) {
        const entity = await this.database.leavingLateEarly.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'leavingLateEarly',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'leavingLateEarly',
            link: `/hrm/leaving-late-early/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin đi muộn, về sớm đã được chuyển`,
                    content: `Đơn xin đi muộn, về sớm đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Application for leaving late and leaving early has been forwarded`,
                    content: `Application for leaving late and leaving early has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ສົ່ງຕໍ່`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການອອກຊ້າແລະອອກໄວ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
