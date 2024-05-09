import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { RiceCouponEvent } from '~/modules/rice-coupon/events/rice-coupon.event';

@Injectable()
export class RiceCouponListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('riceCoupon.created')
    async handleRiceCouponCreatedEvent(event: RiceCouponEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/hrm/rice-coupon/${event.id}?status=true`,
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

    @OnEvent('riceCoupon.pending')
    async handleRiceCouponPendingEvent(event: RiceCouponEvent) {
        const entity = await this.database.riceCoupon.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('riceCoupon:headApprove');
        this.notificationService.createNotification({
            entity: 'riceCoupon',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'riceCoupon',
            link: `/hrm/rice-coupon/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu báo cơm đang chờ phê duyệt`,
                    content: `Phiếu báo cơm đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Rice coupon is pending approval`,
                    content: `Rice coupon is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    @OnEvent('riceCoupon.approved')
    async handleRiceCouponApprovedEvent(event: RiceCouponEvent) {
        const entity = await this.database.riceCoupon.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('riceCoupon:create');

        this.notificationService.createNotification({
            entity: 'riceCoupon',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'riceCoupon',
            link: `/hrm/rice-coupon/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu báo cơm đã được phê duyệt`,
                    content: `Phiếu báo cơm đã được phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Rice coupon has been approved`,
                    content: `Rice coupon has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                    content: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ໄດ້ຮັບອະນຸມັດແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('riceCoupon.rejected')
    async handleRiceCouponRejectedEvent(event: RiceCouponEvent) {
        const entity = await this.database.riceCoupon.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'riceCoupon',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'riceCoupon',
            link: `/hrm/rice-coupon/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu báo cơm đã bị từ chối`,
                    content: `Phiếu báo cơm đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Rice coupon has been rejected`,
                    content: `Rice coupon has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ໄດ້ຖືກປະຕິບັດ`,
                    content: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ໄດ້ຖືກປະຕິບັດ`,
                },
            ],
        });
    }

    @OnEvent('riceCoupon.forwarded')
    async handleRiceCouponForwardedEvent(event: RiceCouponEvent) {
        const entity = await this.database.riceCoupon.findOneBy({ id: event.id });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'riceCoupon',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'riceCoupon',
            link: `/hrm/rice-coupon/${event.id}?status=true`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu báo cơm đã được chuyển`,
                    content: `Phiếu báo cơm đã được chuyển`,
                },
                {
                    lang: 'en',
                    title: `Rice coupon has been forwarded`,
                    content: `Rice coupon has been forwarded`,
                },
                {
                    lang: 'lo',
                    title: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ສົ່ງຕໍ່`,
                    content: `ຄູປ໋ອງເຂົ້າ ແລະອອກ ສົ່ງຕໍ່`,
                },
            ],
        });
    }
}
