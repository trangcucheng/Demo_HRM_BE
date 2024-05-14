import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { FoodVoucherEvent } from '~/modules/food-voucher/events/food-voucher.event';

@Injectable()
export class FoodVoucherListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('foodVoucher.created')
    async handleFoodVoucherCreatedEvent(event: FoodVoucherEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/food-voucher/${event.id}?status=true`,
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

    @OnEvent('foodVoucher.pending')
    async handleFoodVoucherPendingEvent(event: FoodVoucherEvent) {
        const entity = await this.database.foodVoucher.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('foodVoucher:headApprove');
        this.notificationService.createNotification({
            entity: 'foodVoucher',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'foodVoucher',
            link: `/hrm/food-voucher/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu cấp chế độ ăn ca đang chờ phê duyệt`,
                    content: `Phiếu cấp chế độ ăn ca đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Meal vouchers is pending approval`,
                    content: `Meal vouchers is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ບັດອາຫານ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ບັດອາຫານ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('foodVoucher.approved')
    async handleFoodVoucherApprovedEvent(event: FoodVoucherEvent) {
        const entity = await this.database.foodVoucher.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('foodVoucher:create');

        this.notificationService.createNotification({
            entity: 'foodVoucher',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'foodVoucher',
            link: `/hrm/food-voucher/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu cấp chế độ ăn ca đã được phê duyệt`,
                    content: `Phiếu cấp chế độ ăn ca đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Meal vouchers has been approved`,
                    content: `Meal vouchers has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ບັດອາຫານ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ບັດອາຫານ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('foodVoucher.rejected')
    async handleFoodVoucherRejectedEvent(event: FoodVoucherEvent) {
        const entity = await this.database.foodVoucher.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'foodVoucher',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'foodVoucher',
            link: `/hrm/food-voucher/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu cấp chế độ ăn ca đã bị từ chối`,
                    content: `Phiếu cấp chế độ ăn ca đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Meal vouchers has been rejected`,
                    content: `Meal vouchers has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ບັດອາຫານ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ບັດອາຫານ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('foodVoucher.forwarded')
    async handleFoodVoucherForwardedEvent(event: FoodVoucherEvent) {
        const entity = await this.database.foodVoucher.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'foodVoucher',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'foodVoucher',
            link: `/hrm/food-voucher/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu cấp chế độ ăn ca đã được chuyển`,
                    content: `Phiếu cấp chế độ ăn ca đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Meal vouchers has been forwarded`,
                    content: `Meal vouchers has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ບັດອາຫານ ສົ່ງຕໍ່`,
                    content: `ບັດອາຫານ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
