import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { TrackingLogEvent } from '~/modules/tracking-log/events/tracking-log.event';

@Injectable()
export class TrackingLogListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('trackingLog.created')
    async handleTrackingLogCreatedEvent(event: TrackingLogEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/tracking-log/${event.id}?status=true`,
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

    @OnEvent('trackingLog.pending')
    async handleTrackingLogPendingEvent(event: TrackingLogEvent) {
        const entity = await this.database.trackingLog.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('trackingLog:headApprove');
        this.notificationService.createNotification({
            entity: 'trackingLog',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'trackingLog',
            link: `/hrm/tracking-log/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Nhật ký theo dõi ra vào đang chờ phê duyệt`,
                    content: `Nhật ký theo dõi ra vào đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Entry and exit tracking log is pending approval`,
                    content: `Entry and exit tracking log is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('trackingLog.approved')
    async handleTrackingLogApprovedEvent(event: TrackingLogEvent) {
        const entity = await this.database.trackingLog.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('trackingLog:create');

        this.notificationService.createNotification({
            entity: 'trackingLog',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'trackingLog',
            link: `/hrm/tracking-log/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Nhật ký theo dõi ra vào đã được phê duyệt`,
                    content: `Nhật ký theo dõi ra vào đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Entry and exit tracking log has been approved`,
                    content: `Entry and exit tracking log has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('trackingLog.rejected')
    async handleTrackingLogRejectedEvent(event: TrackingLogEvent) {
        const entity = await this.database.trackingLog.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'trackingLog',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'trackingLog',
            link: `/hrm/tracking-log/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Nhật ký theo dõi ra vào đã bị từ chối`,
                    content: `Nhật ký theo dõi ra vào đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Entry and exit tracking log has been rejected`,
                    content: `Entry and exit tracking log has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('trackingLog.forwarded')
    async handleTrackingLogForwardedEvent(event: TrackingLogEvent) {
        const entity = await this.database.trackingLog.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'trackingLog',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'trackingLog',
            link: `/hrm/tracking-log/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Nhật ký theo dõi ra vào đã được chuyển`,
                    content: `Nhật ký theo dõi ra vào đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Entry and exit tracking log has been forwarded`,
                    content: `Entry and exit tracking log has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ສົ່ງຕໍ່`,
                    content: `ບັນທຶກການຕິດຕາມເຂົ້າ ແລະອອກ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
