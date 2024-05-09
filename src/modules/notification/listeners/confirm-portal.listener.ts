import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ConfirmPortalEvent } from '~/modules/confirm-portal/events/confirm-portal.event';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class ConfirmPortalListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('confirmPortal.created')
    async handleConfirmPortalCreatedEvent(event: ConfirmPortalEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/confirm-portal/${event.id}?status=true`,
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

    @OnEvent('confirmPortal.pending')
    async handleConfirmPortalPendingEvent(event: ConfirmPortalEvent) {
        const entity = await this.database.confirmPortal.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('confirmPortal:headApprove');
        this.notificationService.createNotification({
            entity: 'confirmPortal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'confirmPortal',
            link: `/hrm/confirm-portal/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy xác nhận qua cổng bảo vệ đang chờ phê duyệt`,
                    content: `Giấy xác nhận qua cổng bảo vệ đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Confirm portal is pending approval`,
                    content: `Confirm portal is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('confirmPortal.approved')
    async handleConfirmPortalApprovedEvent(event: ConfirmPortalEvent) {
        const entity = await this.database.confirmPortal.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('confirmPortal:create');

        this.notificationService.createNotification({
            entity: 'confirmPortal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'confirmPortal',
            link: `/hrm/confirm-portal/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy xác nhận qua cổng bảo vệ đã được phê duyệt`,
                    content: `Giấy xác nhận qua cổng bảo vệ đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Confirm portal has been approved`,
                    content: `Confirm portal has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('confirmPortal.rejected')
    async handleConfirmPortalRejectedEvent(event: ConfirmPortalEvent) {
        const entity = await this.database.confirmPortal.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'confirmPortal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'confirmPortal',
            link: `/hrm/confirm-portal/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy xác nhận qua cổng bảo vệ đã bị từ chối`,
                    content: `Giấy xác nhận qua cổng bảo vệ đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Confirm portal has been rejected`,
                    content: `Confirm portal has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('confirmPortal.forwarded')
    async handleConfirmPortalForwardedEvent(event: ConfirmPortalEvent) {
        const entity = await this.database.confirmPortal.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'confirmPortal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'confirmPortal',
            link: `/hrm/confirm-portal/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy xác nhận qua cổng bảo vệ đã được chuyển`,
                    content: `Giấy xác nhận qua cổng bảo vệ đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Confirm portal has been forwarded`,
                    content: `Confirm portal has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ສົ່ງຕໍ່`,
                    content: `ການຢືນຢັນຜ່ານປະຕູຄວາມປອດໄພ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
