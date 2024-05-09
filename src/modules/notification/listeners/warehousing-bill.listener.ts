import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { WarehousingBillEvent } from '~/modules/warehousing-bill/events/warehousing-bill.event';

@Injectable()
export class WarehousingBillListener {
    constructor(private readonly nofiticationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('warehousingBill.created')
    async handleWarehousingBillCreatedEvent(event: WarehousingBillEvent) {
        const entity = await this.database.warehousingBill.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('warehousingBill:approve');
        this.nofiticationService.createNotification({
            entity: 'warehousingBill',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'warehousing-bill',
            link: `/warehouse-process/warehousing-bill`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu kho '${entity.name}' đang chờ phê duyệt`,
                    content: `Phiếu kho '${entity.name}' đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Warehousing bill '${entity.name}' is pending approval`,
                    content: `Warehousing bill '${entity.name}' is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ໃບບິນເກັບເງິນ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ໃບບິນເກັບເງິນ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    // @OnEvent('warehousingBill.approved')
    // async handleWarehousingBillApprovedEvent(event: WarehousingBillEvent) {
    //     const entity = await this.database.warehousingBill.findOneBy({ id: event.id });
    //     if (!entity) return;

    //     const receiverIds = await this.database.getUserIdsByPermission('warehousingBill:finish');
    //     this.nofiticationService.createNotification({
    //         entity: 'warehousingBill',
    //         entityId: entity.id,
    //         senderId: event.senderId,
    //         receiverIds: [...receiverIds, entity.createdById],
    //         type: 'warehousing-bill',
    //         link: `/warehouse-process/warehousing-bill`,
    //         details: [
    //             {
    //                 lang: 'vi',
    //                 title: `Phiếu kho '${entity.name}' đã được phê duyệt`,
    //                 content: `Phiếu kho '${entity.name}' đã được phê duyệt`,
    //             },
    //             {
    //                 lang: 'en',
    //                 title: `Warehousing bill '${entity.name}' has been approved`,
    //                 content: `Warehousing bill '${entity.name}' has been approved`,
    //             },
    //             {
    //                 lang: 'lo',
    //                 title: `ໃບບິນເກັບເງິນ '${entity.name}' ແມ່ນອະນຸມັດ`,
    //                 content: `ໃບບິນເກັບເງິນ '${entity.name}' ແມ່ນອະນຸມັດ`,
    //             },
    //         ],
    //     });
    // }

    // @OnEvent('warehousingBill.rejected')
    // async handleWarehousingBillRejectedEvent(event: WarehousingBillEvent) {
    //     const entity = await this.database.warehousingBill.findOneBy({ id: event.id });
    //     if (!entity) return;

    //     this.nofiticationService.createNotification({
    //         entity: 'warehousingBill',
    //         entityId: entity.id,
    //         senderId: event.senderId,
    //         receiverIds: [entity.createdById],
    //         type: 'warehousing-bill',
    //         link: `/warehouse-process/warehousing-bill`,
    //         details: [
    //             {
    //                 lang: 'vi',
    //                 title: `Phiếu kho '${entity.name}' đã bị từ chối`,
    //                 content: `Phiếu kho '${entity.name}' đã bị từ chối`,
    //             },
    //             {
    //                 lang: 'en',
    //                 title: `Warehousing bill '${entity.name}' has been rejected`,
    //                 content: `Warehousing bill '${entity.name}' has been rejected`,
    //             },
    //             {
    //                 lang: 'lo',
    //                 title: `ໃບບິນເກັບເງິນ '${entity.name}' ໄດ້ຖືກປະຕິເສດ`,
    //                 content: `ໃບບິນເກັບເງິນ '${entity.name}' ໄດ້ຖືກປະຕິເສດ`,
    //             },
    //         ],
    //     });
    // }

    @OnEvent('warehousingBill.returned')
    async handleWarehousingBillReturnedEvent(event: WarehousingBillEvent) {
        const entity = await this.database.warehousingBill.findOneBy({ id: event.id });
        if (!entity) return;

        this.nofiticationService.createNotification({
            entity: 'warehousingBill',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'warehousing-bill',
            link: `/warehouse-process/warehousing-bill`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu kho '${entity.name}' đã bị trả lại`,
                    content: `Phiếu kho '${entity.name}' đã bị trả lại`,
                },
                {
                    lang: 'en',
                    title: `Warehousing bill '${entity.name}' has been returned`,
                    content: `Warehousing bill '${entity.name}' has been returned`,
                },
                {
                    lang: 'lo',
                    title: `ໃບບິນເກັບເງິນ '${entity.name}' ໄດ້ຖືກສົ່ງຄືນ`,
                    content: `ໃບບິນເກັບເງິນ '${entity.name}' ໄດ້ຖືກສົ່ງຄືນ`,
                },
            ],
        });
    }

    @OnEvent('warehousingBill.finished')
    async handleWarehousingBillFinishedEvent(event: WarehousingBillEvent) {
        const entity = await this.database.warehousingBill.findOneBy({ id: event.id });
        if (!entity) return;

        const proposal = await this.database.proposal.findOneBy({ id: entity.proposalId });
        if (proposal) {
            this.nofiticationService.createNotification({
                entity: 'proposal',
                entityId: entity.proposalId,
                senderId: event.senderId,
                receiverIds: [proposal.createdById],
                type: 'proposal',
                link: `/product-management/proposal`,
                details: [
                    {
                        lang: 'vi',
                        title: `Yêu cầu '${proposal.name}' đã hoàn thành`,
                        content: `Yêu cầu '${proposal.name}' đã hoàn thành`,
                    },
                    {
                        lang: 'en',
                        title: `Proposal '${proposal.name}' has been finished`,
                        content: `Proposal '${proposal.name}' has been finished`,
                    },
                    {
                        lang: 'lo',
                        title: `ຄຳປະກາດ '${proposal.name}' ໄດ້ສຳເລັດແລ້ວ`,
                        content: `ຄຳປະກາດ '${proposal.name}' ໄດ້ສຳເລັດແລ້ວ`,
                    },
                ],
            });
        }

        this.nofiticationService.createNotification({
            entity: 'warehousingBill',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'warehousing-bill',
            link: `/warehouse-process/warehousing-bill`,
            details: [
                {
                    lang: 'vi',
                    title: `Phiếu kho '${entity.name}' đã hoàn thành`,
                    content: `Phiếu kho '${entity.name}' đã hoàn thành`,
                },
                {
                    lang: 'en',
                    title: `Warehousing bill '${entity.name}' has been finished`,
                    content: `Warehousing bill '${entity.name}' has been finished`,
                },
                {
                    lang: 'lo',
                    title: `ໃບບິນເກັບເງິນ '${entity.name}' ໄດ້ສຳເລັດແລ້ວ`,
                    content: `ໃບບິນເກັບເງິນ '${entity.name}' ໄດ້ສຳເລັດແລ້ວ`,
                },
            ],
        });
    }
}
