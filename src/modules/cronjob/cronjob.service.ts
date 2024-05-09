import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';
import { In } from 'typeorm';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CronJobEvent } from '~/modules/cronjob/events/cronjob.event';
import { CronService, UtilService } from '~/shared/services';

@Injectable()
export class CronjobService {
    constructor(
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
        private readonly cronService: CronService,
        private eventEmitter: EventEmitter2,
    ) {
        this.init();
    }

    private init() {
        // every day at 00:00
        this.cronService.addCronJob('CHECK_EXPIRED_PRODUCT', '0 0 * * *', () => {
            this.checkExpiredProduct();
        });

        // other cron jobs
        // TODO: warning product limit
    }

    private async checkExpiredProduct() {
        // warning if expired date is less than or equal to 15 days
        const products = await this.database.inventory.getExpiredProducts();
        const receiver = await this.database.user.find({
            where: { departmentId: In(products.map((product) => product.warehouseDepartmentId)) },
            select: ['id', 'departmentId'],
        });

        // notify to manager of warehouse
        products.forEach((product) => {
            // send notification
            this.emitEvent('cronjob.expiredProduct', {
                receiverIds: receiver.filter((user) => user.departmentId === product.warehouseDepartmentId).map((user) => user.id),
                product: { id: product.productId, name: product.productName, expiredAt: moment(product.expiredAt).format('DD/MM/YYYY') },
                warehouse: { id: product.warehouseId, name: product.warehouseName },
            });
        });
    }

    private emitEvent(
        event: string,
        data: { receiverIds: number[]; product: { id: number; name: string; expiredAt: string }; warehouse: { id: number; name: string } },
    ) {
        const eventObj = new CronJobEvent();
        eventObj.receiverIds = data.receiverIds;
        eventObj.product = data.product;
        eventObj.warehouse = data.warehouse;
        this.eventEmitter.emit(event, eventObj);
    }
}
