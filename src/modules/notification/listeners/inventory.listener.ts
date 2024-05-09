import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';

@Injectable()
export class InventoryListener {
    constructor(private readonly notificationService: NotificationService, private readonly database: DatabaseService) {}

    @OnEvent('inventory.notifyLimits')
    async handleInventoryNotifyLimitsEvent(
        events: {
            receiverIds: number[];
            warehouseName: string;
            productId: number;
            productName: string;
            quantity: number;
            min?: number;
            max?: number;
        }[],
    ) {
        events.forEach((event) => {
            if (!event.receiverIds?.length) return;

            let details = [];
            if (event.min > 0) {
                details = [
                    {
                        lang: 'vi',
                        title: 'Số lượng sản phẩm tại kho đã dưới mức tối thiểu',
                        content: `Số lượng sản phẩm '${event.productName}' tại kho '${event.warehouseName}' đã dưới mức tối thiểu ${event.min}`,
                    },
                    {
                        lang: 'en',
                        title: 'The quantity of products at the warehouse is below the minimum',
                        content: `The quantity of products '${event.productName}' at the warehouse '${event.warehouseName}' is below the minimum ${event.min}`,
                    },
                    {
                        lang: 'lo',
                        title: 'ປະລິມານສິນຄ້າຢູ່ໃນສາງແມ່ນຕໍ່າກວ່າຕໍາ່ສຸດທີ່',
                        content: `ປະລິມານຂອງຜະລິດຕະພັນ '${event.productName}' ຢູ່ສາງ '${event.warehouseName}' ແມ່ນຕ່ຳກວ່າ ${event.min}`,
                    },
                ];
            }
            if (event.max > 0) {
                details = [
                    {
                        lang: 'vi',
                        title: 'Số lượng sản phẩm tại kho đã vượt mức tối đa',
                        content: `Số lượng sản phẩm '${event.productName}' tại kho '${event.warehouseName}' đã vượt mức tối đa ${event.max}`,
                    },
                    {
                        lang: 'en',
                        title: 'The quantity of products at the warehouse has exceeded the maximum',
                        content: `The quantity of products '${event.productName}' at the warehouse '${event.warehouseName}' has exceeded the maximum ${event.max}`,
                    },
                    {
                        lang: 'en',
                        title: 'ປະລິມານສິນຄ້າຢູ່ໃນສາງໄດ້ເກີນລະດັບສູງສຸດ',
                        content: `ປະລິມານຂອງຜະລິດຕະພັນ '${event.productName}' ຢູ່ສາງ '${event.warehouseName}' ໄດ້ເກີນຈຳນວນສູງສຸດ ${event.max}`,
                    },
                ];
            }

            this.notificationService.createNotification({
                entity: null,
                entityId: null,
                senderId: 1,
                receiverIds: event.receiverIds,
                type: 'inventory',
                link: null,
                details: details,
            });
        });
    }
}
