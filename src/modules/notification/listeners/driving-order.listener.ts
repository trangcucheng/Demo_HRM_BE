import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { DrivingOrderEvent } from '~/modules/driving-order/events/driving-order.event';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class DrivingOrderListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('drivingOrder.created')
    async handleDrivingOrderCreatedEvent(event: DrivingOrderEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/driving-order/${event.id}?status=true`,
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

    @OnEvent('drivingOrder.pending')
    async handleDrivingOrderPendingEvent(event: DrivingOrderEvent) {
        const entity = await this.database.drivingOrder.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('drivingOrder:headApprove');
        this.notificationService.createNotification({
            entity: 'drivingOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'drivingOrder',
            link: `/hrm/driving-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường kiêm lệnh điều xe đang chờ phê duyệt`,
                    content: `Giấy đi đường kiêm lệnh điều xe đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Travel document cum driving order is pending approval`,
                    content: `Travel document cum driving order is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('drivingOrder.approved')
    async handleDrivingOrderApprovedEvent(event: DrivingOrderEvent) {
        const entity = await this.database.drivingOrder.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('drivingOrder:create');

        this.notificationService.createNotification({
            entity: 'drivingOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'drivingOrder',
            link: `/hrm/driving-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường kiêm lệnh điều xe đã được phê duyệt`,
                    content: `Giấy đi đường kiêm lệnh điều xe đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Travel document cum driving order has been approved`,
                    content: `Travel document cum driving order has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('drivingOrder.rejected')
    async handleDrivingOrderRejectedEvent(event: DrivingOrderEvent) {
        const entity = await this.database.drivingOrder.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'drivingOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'drivingOrder',
            link: `/hrm/driving-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường kiêm lệnh điều xe đã bị từ chối`,
                    content: `Giấy đi đường kiêm lệnh điều xe đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Travel document cum driving order has been rejected`,
                    content: `Travel document cum driving order has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('drivingOrder.forwarded')
    async handleDrivingOrderForwardedEvent(event: DrivingOrderEvent) {
        const entity = await this.database.drivingOrder.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'drivingOrder',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'drivingOrder',
            link: `/hrm/driving-order/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Giấy đi đường kiêm lệnh điều xe đã được chuyển`,
                    content: `Giấy đi đường kiêm lệnh điều xe đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Travel document cum driving order has been forwarded`,
                    content: `Travel document cum driving order has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ສົ່ງຕໍ່`,
                    content: `ເອ​ກະ​ສານ​ການ​ເດີນ​ທາງ​ແລະ​ຄໍາ​ສັ່ງ​ຂັບ​ລົດ​ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
