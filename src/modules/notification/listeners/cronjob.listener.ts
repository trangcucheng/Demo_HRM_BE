import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CronJobEvent } from '~/modules/cronjob/events/cronjob.event';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class CronJobListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('cronjob.expiredProduct')
    async handleCronJobExpiredProductEvent(event: CronJobEvent) {
        this.notificationService.createNotification({
            entity: 'product',
            entityId: event.product.id,
            senderId: null,
            receiverIds: event.receiverIds,
            type: 'product',
            link: `/product/${event.product.id}`,
            details: [
                {
                    lang: 'vi',
                    title: `Sản phẩm '${event.product.name}' tại kho '${event.warehouse.name}' sẽ hết hạn vào ngày ${event.product.expiredAt}`,
                    content: `Sản phẩm '${event.product.name}' tại kho '${event.warehouse.name}' sẽ hết hạn vào ngày ${event.product.expiredAt}`,
                },
                {
                    lang: 'en',
                    title: `Product '${event.product.name}' at warehouse '${event.warehouse.name}' will expire on ${event.product.expiredAt}`,
                    content: `Product '${event.product.name}' at warehouse '${event.warehouse.name}' will expire on ${event.product.expiredAt}`,
                },
                {
                    lang: 'lo',
                    title: `ຜະລິດຕະພັນ '${event.product.name}' ຢູ່ສາງ '${event.warehouse.name}' ຈະໝົດອາຍຸໃນວັນທີ ${event.product.expiredAt}`,
                    content: `ຜະລິດຕະພັນ '${event.product.name}' ຢູ່ສາງ '${event.warehouse.name}' ຈະໝົດອາຍຸໃນວັນທີ ${event.product.expiredAt}`,
                },
            ],
        });
    }
}
