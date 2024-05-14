import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { TravelPaperEvent } from '~/modules/travel-paper/events/travel-paper.event';

@Injectable()
export class TravelPaperListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('travelPaper.created')
    async handleTravelPaperCreatedEvent(event: TravelPaperEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/travel-paper/${event.id}?status=true`,
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

    @OnEvent('travelPaper.pending')
    async handleTravelPaperPendingEvent(event: TravelPaperEvent) {
        const entity = await this.database.travelPaper.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('travelPaper:headApprove');
        this.notificationService.createNotification({
            entity: 'travelPaper',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'travelPaper',
            link: `/hrm/travel-paper/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường đang chờ phê duyệt`,
                    content: `Giấy đi đường đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Travel paper is pending approval`,
                    content: `Travel paper is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ເອກະສານການເດີນທາງ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ເອກະສານການເດີນທາງ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('travelPaper.approved')
    async handleTravelPaperApprovedEvent(event: TravelPaperEvent) {
        const entity = await this.database.travelPaper.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('travelPaper:create');

        this.notificationService.createNotification({
            entity: 'travelPaper',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'travelPaper',
            link: `/hrm/travel-paper/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường đã được phê duyệt`,
                    content: `Giấy đi đường đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Travel paper has been approved`,
                    content: `Travel paper has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ເອກະສານການເດີນທາງ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ເອກະສານການເດີນທາງ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('travelPaper.rejected')
    async handleTravelPaperRejectedEvent(event: TravelPaperEvent) {
        const entity = await this.database.travelPaper.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'travelPaper',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'travelPaper',
            link: `/hrm/travel-paper/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường đã bị từ chối`,
                    content: `Giấy đi đường đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Travel paper has been rejected`,
                    content: `Travel paper has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ເອກະສານການເດີນທາງ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ເອກະສານການເດີນທາງ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('travelPaper.forwarded')
    async handleTravelPaperForwardedEvent(event: TravelPaperEvent) {
        const entity = await this.database.travelPaper.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'travelPaper',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'travelPaper',
            link: `/hrm/travel-paper/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường đã được chuyển`,
                    content: `Giấy đi đường đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Travel paper has been forwarded`,
                    content: `Travel paper has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ເອກະສານການເດີນທາງ ສົ່ງຕໍ່`,
                    content: `ເອກະສານການເດີນທາງ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
