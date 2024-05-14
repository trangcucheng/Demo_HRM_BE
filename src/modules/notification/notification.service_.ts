import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class NotificationService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) { }

    async findAll(queries: FilterDto & { lang?: string; type?: string }) {
        return this.database.notification.getNotificationByReceiverId({
            receiverId: UserStorage.getId(),
            ...queries,
            type: queries.type,
            lang: queries.lang || 'vi',
        });
    }

    findOne(id: string, lang: string = 'vi') {
        const builder = this.database.notification.createQueryBuilder('notification');
        builder.leftJoinAndSelect('notification.sender', 'sender');
        builder.leftJoinAndSelect('notification.details', 'details');
        builder.where('notification.id = :id', { id });
        builder.andWhere('notification.receiverId = :receiverId', { receiverId: UserStorage.getId() });
        builder.andWhere('details.lang = :lang', { lang });
        builder.select(['notification', 'sender.id', 'sender.fullName', 'details.title', 'details.content', 'details.lang']);
        return builder.getOne();
    }

    async countUnread() {
        const res = await this.database.notification.countBy({ receiverId: UserStorage.getId(), isRead: false });
        return { count: res };
    }

    async markAsRead(notificationId: number) {
        if (!notificationId) return;
        return this.database.notification.update({ id: notificationId, receiverId: UserStorage.getId() }, { isRead: true });
    }

    async markAllAsRead() {
        return this.database.notification.update({ receiverId: UserStorage.getId() }, { isRead: true });
    }

    async createNotification(data: {
        entity: string;
        entityId: number;
        senderId: number;
        receiverIds: number[];
        type: string;
        link: string;
        details: { lang: string; title: string; content: string }[];
    }) {
        if (!data.receiverIds || data.receiverIds.length === 0) return;
        const entities = data.receiverIds
            .filter((value, index, array) => array.indexOf(value) === index)
            .map((receiverId) => {
                return this.database.notification.create({
                    entity: data.entity,
                    entityId: data.entityId,
                    senderId: data.senderId,
                    receiverId,
                    type: data.type,
                    link: data.link,
                });
            });

        if (entities.length === 0) return;
        const notifications = await this.database.notification.save(entities);
        if (data.details && data.details.length > 0) {
            for (const notification of notifications) {
                this.createNotificationDetails(notification.id, data.details);
            }
        }

        return notifications;
    }

    private createNotificationDetails(notificationId: number, data: { lang: string; title: string; content: string }[]) {
        const entities = data.map((item) => {
            return this.database.notificationDetail.create({
                ...item,
                notificationId: notificationId,
            });
        });
        return this.database.notificationDetail.save(entities);
    }
}
