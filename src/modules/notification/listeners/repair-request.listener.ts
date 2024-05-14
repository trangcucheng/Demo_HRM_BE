import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { RepairRequestEvent } from '~/modules/repair-request/events/repair-request.event';

@Injectable()
export class RepairRequestListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('repairRequest.created')
    async handleRepairRequestCreatedEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('repairRequest:headApprove');
        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.repairById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được tạo`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được tạo`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been created`,
                    content: `Repair request '${entity.name}' has been created`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສ້າງແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('repairRequest.headApprove')
    async handleRepairRequestHeadApproveEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');
        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.repairById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được trưởng bộ phận phê duyệt`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được trưởng bộ phận phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been approved by head of department`,
                    content: `Repair request '${entity.name}' has been approved by head of department`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍການສ້ອມແປງ '${entity.name}' ໄດ້ຮັບການອະນຸມັດຈາກຫົວໜ້າພະແນກ`,
                    content: `ຄຄຳຮ້ອງຂໍການສ້ອມແປງ '${entity.name}' ໄດ້ຮັບການອະນຸມັດຈາກຫົວໜ້າພະແນກ`,
                },
            ],
        });
    }

    @OnEvent('repairRequest.headReject')
    async handleRepairRequestHeadRejectEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        const receiverIds = [entity.createdById];
        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.repairById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã bị trưởng bộ phận từ chối`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã bị trưởng bộ phận từ chối`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been rejected by head of department`,
                    content: `Repair request '${entity.name}' has been rejected by head of department`,
                },
                {
                    lang: 'lo',
                    title: `ການຮ້ອງຂໍສ້ອມແປງ '${entity.name}' ຖືກປະຕິເສດໂດຍຫົວໜ້າພະແນກ`,
                    content: `ການຮ້ອງຂໍສ້ອມແປງ '${entity.name}' ຖືກປະຕິເສດໂດຍຫົວໜ້າພະແນກ`,
                },
            ],
        });
    }

    @OnEvent('repairRequest.inProgress')
    async handleRepairRequestInProgressEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('repairRequest:complete');
        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.repairById, entity.createdById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được tiếp nhận`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được tiếp nhận`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been received`,
                    content: `Repair request '${entity.name}' has been received`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກຮັບແລ້ວ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກຮັບແລ້ວ`,
                },
            ],
        });
    }

    @OnEvent('repairRequest.completed')
    async handleRepairRequestCompletedEvent(event: RepairRequestEvent) {
        const entity = await this.database.repairRequest.findOne({ where: { id: event.id }, relations: ['repairBy'] });
        if (!entity) return;

        this.notificationService.createNotification({
            entity: 'repairRequest',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById, entity.repairById],
            type: 'repairRequest',
            link: `/warehouse-process/repair`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu sửa chữa '${entity.name}' đã được hoàn thành`,
                    content: `Yêu cầu sửa chữa '${entity.name}' đã được hoàn thành`,
                },
                {
                    lang: 'en',
                    title: `Repair request '${entity.name}' has been completed`,
                    content: `Repair request '${entity.name}' has been completed`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສຳເລັດ`,
                    content: `ຄຳຮ້ອງຂໍສິນຄ້າຄົງຄັງ '${entity.name}' ຖືກສຳເລັດ`,
                },
            ],
        });
    }

    // @OnEvent('repairRequest.headApproved')
    // @OnEvent('repairRequest.headRejected')
    // @OnEvent('repairRequest.managerApproved')
    // @OnEvent('repairRequest.managerRejected')
    // @OnEvent('repairRequest.administrativeApproved')
    // @OnEvent('repairRequest.administrativeRejected')
    // @OnEvent('repairRequest.bodApproved')
    // @OnEvent('repairRequest.bodRejected')
}
