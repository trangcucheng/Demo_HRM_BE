import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { LeaveApplicationEvent } from '~/modules/leave-application/events/leave-application.event';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class LeaveApplicationListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('leaveApplication.created')
    async handleLeaveApplicationCreatedEvent(event: LeaveApplicationEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/leave-application/${event.id}?status=true`,
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

    @OnEvent('leaveApplication.pending')
    async handleLeaveApplicationPendingEvent(event: LeaveApplicationEvent) {
        const entity = await this.database.leaveApplication.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('leaveApplication:headApprove');
        this.notificationService.createNotification({
            entity: 'leaveApplication',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'leaveApplication',
            link: `/hrm/leave-application/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn nghỉ phép đang chờ phê duyệt`,
                    content: `Đơn nghỉ phép đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Leave application is pending approval`,
                    content: `Leave application is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('leaveApplication.approved')
    async handleLeaveApplicationApprovedEvent(event: LeaveApplicationEvent) {
        const entity = await this.database.leaveApplication.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('leaveApplication:create');

        this.notificationService.createNotification({
            entity: 'leaveApplication',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'leaveApplication',
            link: `/hrm/leave-application/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn nghỉ phép đã được phê duyệt`,
                    content: `Đơn nghỉ phép đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Leave application has been approved`,
                    content: `Leave application has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('leaveApplication.rejected')
    async handleLeaveApplicationRejectedEvent(event: LeaveApplicationEvent) {
        const entity = await this.database.leaveApplication.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'leaveApplication',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'leaveApplication',
            link: `/hrm/leave-application/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn nghỉ phép đã bị từ chối`,
                    content: `Đơn nghỉ phép đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Leave application has been rejected`,
                    content: `Leave application has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('leaveApplication.forwarded')
    async handleLeaveApplicationForwardedEvent(event: LeaveApplicationEvent) {
        const entity = await this.database.leaveApplication.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'leaveApplication',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'leaveApplication',
            link: `/hrm/leave-application/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn nghỉ phép đã được chuyển`,
                    content: `Đơn nghỉ phép đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Leave application has been forwarded`,
                    content: `Leave application has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ສົ່ງຕໍ່`,
                    content: `ອອກຈາກຄໍາຮ້ອງສະຫມັກ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
