import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { StocktakeEvent } from '~/modules/stocktake/events/stocktake.event';

@Injectable()
export class StocktakeListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('stocktake.created')
    async handleStocktakeCreatedEvent(event: StocktakeEvent) {
        const entity = await this.database.stocktake.findOne({ where: { id: event.id }, relations: ['participants'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('stocktake:start');
        this.notificationService.createNotification({
            entity: 'stocktake',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, ...entity.participants.map((p) => p.id)],
            type: 'stocktake',
            link: `/warehouse-management/stocktake`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu kiểm kê '${entity.name}' đã được tạo`,
                    content: `Yêu cầu kiểm kê '${entity.name}' đã được tạo`,
                },
                {
                    lang: 'en',
                    title: `Stocktake '${entity.name}' has been created`,
                    content: `Stocktake '${entity.name}' has been created`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('stocktake.started')
    async handleStocktakeStartedEvent(event: StocktakeEvent) {
        const entity = await this.database.stocktake.findOne({ where: { id: event.id }, relations: ['participants'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('stocktake:finish');
        this.notificationService.createNotification({
            entity: 'stocktake',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, ...entity.participants.map((p) => p.id, entity.createdById)],
            type: 'stocktake',
            link: `/warehouse-management/stocktake`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu kiểm kê '${entity.name}' đã được bắt đầu`,
                    content: `Yêu cầu kiểm kê '${entity.name}' đã được bắt đầu`,
                },
                {
                    lang: 'en',
                    title: `Stocktake '${entity.name}' has been started`,
                    content: `Stocktake '${entity.name}' has been started`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກເລີ່ມຕົ້ນ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກເລີ່ມຕົ້ນ`,
                },
            ],
        });
    }

    @OnEvent('stocktake.cancelled')
    async handleStocktakeCancelledEvent(event: StocktakeEvent) {
        const entity = await this.database.stocktake.findOne({ where: { id: event.id }, relations: ['participants'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('stocktake:start');
        this.notificationService.createNotification({
            entity: 'stocktake',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, ...entity.participants.map((p) => p.id, entity.createdById)],
            type: 'stocktake',
            link: `/warehouse-management/stocktake`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu kiểm kê '${entity.name}' đã bị hủy`,
                    content: `Yêu cầu kiểm kê '${entity.name}' đã bị hủy`,
                },
                {
                    lang: 'en',
                    title: `Stocktake '${entity.name}' has been cancelled`,
                    content: `Stocktake '${entity.name}' has been cancelled`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກຍົກເລີກ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກຍົກເລີກ`,
                },
            ],
        });
    }

    @OnEvent('stocktake.finished')
    async handleStocktakeFinishedEvent(event: StocktakeEvent) {
        const entity = await this.database.stocktake.findOne({ where: { id: event.id }, relations: ['participants'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('stocktake:approve');
        this.notificationService.createNotification({
            entity: 'stocktake',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, ...entity.participants.map((p) => p.id, entity.createdById)],
            type: 'stocktake',
            link: `/warehouse-management/stocktake`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu kiểm kê '${entity.name}' đã được hoàn thành`,
                    content: `Yêu cầu kiểm kê '${entity.name}' đã được hoàn thành`,
                },
                {
                    lang: 'en',
                    title: `Stocktake '${entity.name}' has been finished`,
                    content: `Stocktake '${entity.name}' has been finished`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສົ່ງສິ່ງ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສົ່ງສິ່ງ`,
                },
            ],
        });
    }

    @OnEvent('stocktake.approved')
    async handleStocktakeApprovedEvent(event: StocktakeEvent) {
        const entity = await this.database.stocktake.findOne({ where: { id: event.id }, relations: ['participants'] });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'stocktake',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...entity.participants.map((p) => p.id, entity.createdById)],
            type: 'stocktake',
            link: `/warehouse-management/stocktake`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu kiểm kê '${entity.name}' đã được duyệt`,
                    content: `Yêu cầu kiểm kê '${entity.name}' đã được duyệt`,
                },
                {
                    lang: 'en',
                    title: `Stocktake '${entity.name}' has been approved`,
                    content: `Stocktake '${entity.name}' has been approved`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກອະນຸຍາດ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກອະນຸຍາດ`,
                },
            ],
        });
    }

    @OnEvent('stocktake.rejected')
    async handleStocktakeRejectedEvent(event: StocktakeEvent) {
        const entity = await this.database.stocktake.findOne({ where: { id: event.id }, relations: ['participants'] });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'stocktake',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...entity.participants.map((p) => p.id, entity.createdById)],
            type: 'stocktake',
            link: `/warehouse-management/stocktake`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu kiểm kê '${entity.name}' đã bị từ chối`,
                    content: `Yêu cầu kiểm kê '${entity.name}' đã bị từ chối`,
                },
                {
                    lang: 'en',
                    title: `Stocktake '${entity.name}' has been rejected`,
                    content: `Stocktake '${entity.name}' has been rejected`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກປະຕິຍາດ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກປະຕິຍາດ`,
                },
            ],
        });
    }

    // @OnEvent('stocktake.headApproved')
    // @OnEvent('stocktake.headRejected')
    // @OnEvent('stocktake.managerApproved')
    // @OnEvent('stocktake.managerRejected')
    // @OnEvent('stocktake.administrativeApproved')
    // @OnEvent('stocktake.administrativeRejected')
    // @OnEvent('stocktake.bodApproved')
    // @OnEvent('stocktake.bodRejected')
}
