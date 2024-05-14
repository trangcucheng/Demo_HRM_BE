import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { RequestOvertimeEvent } from '~/modules/request-overtime/events/request-overtime.event';

@Injectable()
export class RequestOvertimeListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('requestOvertime.created')
    async handleRequestOvertimeCreatedEvent(event: RequestOvertimeEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/request-overtime/${event.id}?status=true`,
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

    @OnEvent('requestOvertime.pending')
    async handleRequestOvertimePendingEvent(event: RequestOvertimeEvent) {
        const entity = await this.database.requestOvertime.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('requestOvertime:headApprove');
        this.notificationService.createNotification({
            entity: 'requestOvertime',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'requestOvertime',
            link: `/hrm/request-overtime/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đề nghị tăng ca đang chờ phê duyệt`,
                    content: `Giấy đề nghị tăng ca đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Request overtime is pending approval`,
                    content: `Request overtime is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('requestOvertime.approved')
    async handleRequestOvertimeApprovedEvent(event: RequestOvertimeEvent) {
        const entity = await this.database.requestOvertime.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('requestOvertime:create');

        this.notificationService.createNotification({
            entity: 'requestOvertime',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'requestOvertime',
            link: `/hrm/request-overtime/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đề nghị tăng ca đã được phê duyệt`,
                    content: `Giấy đề nghị tăng ca đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Request overtime has been approved`,
                    content: `Request overtime has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('requestOvertime.rejected')
    async handleRequestOvertimeRejectedEvent(event: RequestOvertimeEvent) {
        const entity = await this.database.requestOvertime.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'requestOvertime',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'requestOvertime',
            link: `/hrm/request-overtime/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đề nghị tăng ca đã bị từ chối`,
                    content: `Giấy đề nghị tăng ca đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Request overtime has been rejected`,
                    content: `Request overtime has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('requestOvertime.forwarded')
    async handleRequestOvertimeForwardedEvent(event: RequestOvertimeEvent) {
        const entity = await this.database.requestOvertime.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'requestOvertime',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'requestOvertime',
            link: `/hrm/request-overtime/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đề nghị tăng ca đã được chuyển`,
                    content: `Giấy đề nghị tăng ca đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Request overtime has been forwarded`,
                    content: `Request overtime has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ສົ່ງຕໍ່`,
                    content: `ຄໍາຮ້ອງສະຫມັກສໍາລັບການລ່ວງເວລາ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
