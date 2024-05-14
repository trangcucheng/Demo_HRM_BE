import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { ResignationLetterEvent } from '~/modules/resignation-letter/events/resignation-letter.event';

@Injectable()
export class ResignationLetterListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('resignationLetter.created')
    async handleResignationLetterCreatedEvent(event: ResignationLetterEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/resignation-letter/${event.id}?status=true`,
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

    @OnEvent('resignationLetter.pending')
    async handleResignationLetterPendingEvent(event: ResignationLetterEvent) {
        const entity = await this.database.resignationLetter.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('resignationLetter:headApprove');
        this.notificationService.createNotification({
            entity: 'resignationLetter',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'resignationLetter',
            link: `/hrm/resignation-letter/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin thôi việc đang chờ phê duyệt`,
                    content: `Đơn xin thôi việc đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Resignation letter is pending approval`,
                    content: `Resignation letter is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ຈົດໝາຍລາອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ຈົດໝາຍລາອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('resignationLetter.approved')
    async handleResignationLetterApprovedEvent(event: ResignationLetterEvent) {
        const entity = await this.database.resignationLetter.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('resignationLetter:create');

        this.notificationService.createNotification({
            entity: 'resignationLetter',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'resignationLetter',
            link: `/hrm/resignation-letter/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin thôi việc đã được phê duyệt`,
                    content: `Đơn xin thôi việc đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Resignation letter has been approved`,
                    content: `Resignation letter has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ຈົດໝາຍລາອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ຈົດໝາຍລາອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('resignationLetter.rejected')
    async handleResignationLetterRejectedEvent(event: ResignationLetterEvent) {
        const entity = await this.database.resignationLetter.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'resignationLetter',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'resignationLetter',
            link: `/hrm/resignation-letter/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin thôi việc đã bị từ chối`,
                    content: `Đơn xin thôi việc đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Resignation letter has been rejected`,
                    content: `Resignation letter has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ຈົດໝາຍລາອອກ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ຈົດໝາຍລາອອກ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('resignationLetter.forwarded')
    async handleResignationLetterForwardedEvent(event: ResignationLetterEvent) {
        const entity = await this.database.resignationLetter.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'resignationLetter',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'resignationLetter',
            link: `/hrm/resignation-letter/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn xin thôi việc đã được chuyển`,
                    content: `Đơn xin thôi việc đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Resignation letter has been forwarded`,
                    content: `Resignation letter has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ຈົດໝາຍລາອອກ ສົ່ງຕໍ່`,
                    content: `ຈົດໝາຍລາອອກ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
