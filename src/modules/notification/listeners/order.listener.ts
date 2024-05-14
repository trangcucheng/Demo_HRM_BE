import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class OrderListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('order.created')
    async handleOrderCreatedEvent(event: any) {
        const entity = await this.database.order.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('order:placeOrder');
        this.notificationService.createNotification({
            entity: 'order',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'order',
            link: `/warehouse-process/order`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn hàng '${entity.name}' đã được tạo`,
                    content: `Đơn hàng '${entity.name}' đã được tạo`,
                },
                {
                    lang: 'en',
                    title: `Order '${entity.name}' has been created`,
                    content: `Order '${entity.name}' has been created`,
                },
                {
                    lang: 'lo',
                    title: `ສັນຍາລັກ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                    content: `ສັນຍາລັກ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('order.placed')
    async handleOrderPlacedEvent(event: any) {
        const entity = await this.database.order.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('order:shipping');
        this.notificationService.createNotification({
            entity: 'order',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'order',
            link: `/warehouse-process/order`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn hàng '${entity.name}' đã được đặt hàng`,
                    content: `Đơn hàng '${entity.name}' đã được đặt hàng`,
                },
                {
                    lang: 'en',
                    title: `Order '${entity.name}' has been placed`,
                    content: `Order '${entity.name}' has been placed`,
                },
                {
                    lang: 'lo',
                    title: `ສັນຍາລັກ '${entity.name}' ຖືກສັ່ງຊື້ແລ້ວ`,
                    content: `ສັນຍາລັກ '${entity.name}' ຖືກສັ່ງຊື້ແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('order.shipping')
    async handleOrderShippingEvent(event: any) {
        const entity = await this.database.order.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('order:receive');
        this.notificationService.createNotification({
            entity: 'order',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'order',
            link: `/warehouse-process/order`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn hàng '${entity.name}' đang được giao hàng`,
                    content: `Đơn hàng '${entity.name}' đang được giao hàng`,
                },
                {
                    lang: 'en',
                    title: `Order '${entity.name}' is being shipped`,
                    content: `Order '${entity.name}' is being shipped`,
                },
                {
                    lang: 'lo',
                    title: `ສັນຍາລັກ '${entity.name}' ກ່ອນການຈັດສົນ`,
                    content: `ສັນຍາລັກ '${entity.name}' ກ່ອນການຈັດສົນ`,
                },
            ],
        });
    }

    @OnEvent('order.received')
    async handleOrderReceivedEvent(event: any) {
        const entity = await this.database.order.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');
        this.notificationService.createNotification({
            entity: 'order',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'order',
            link: `/warehouse-process/order`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn hàng '${entity.name}' đã được nhận`,
                    content: `Đơn hàng '${entity.name}' đã được nhận`,
                },
                {
                    lang: 'en',
                    title: `Order '${entity.name}' has been received`,
                    content: `Order '${entity.name}' has been received`,
                },
                {
                    lang: 'lo',
                    title: `ສັນຍາລັກ '${entity.name}' ຖືກຮັບແລ້ວ`,
                    content: `ສັນຍາລັກ '${entity.name}' ຖືກຮັບແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('order.cancelled')
    async handleOrderCancelledEvent(event: any) {
        const entity = await this.database.order.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('order:placeOrder');
        this.notificationService.createNotification({
            entity: 'order',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'order',
            link: `/warehouse-process/order`,
            details: [
                {
                    lang: 'vi',
                    title: `Đơn hàng '${entity.name}' đã bị hủy`,
                    content: `Đơn hàng '${entity.name}' đã bị hủy`,
                },
                {
                    lang: 'en',
                    title: `Order '${entity.name}' has been cancelled`,
                    content: `Order '${entity.name}' has been cancelled`,
                },
                {
                    lang: 'lo',
                    title: `ສັນຍາລັກ '${entity.name}' ຖືກຍົກເລີກ`,
                    content: `ສັນຍາລັກ '${entity.name}' ຖືກຍົກເລີກ`,
                },
            ],
        });
    }

    // @OnEvent('order.headApproved')
    // @OnEvent('order.headRejected')
    // @OnEvent('order.managerApproved')
    // @OnEvent('order.managerRejected')
    // @OnEvent('order.administrativeApproved')
    // @OnEvent('order.administrativeRejected')
    // @OnEvent('order.bodApproved')
    // @OnEvent('order.bodRejected')
}
