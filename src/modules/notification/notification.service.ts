import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './model/notification.model';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
    ) { }

    async findAll(queries: FilterDto & { lang?: string; type?: string }) {
        return this.getNotificationByReceiverId({
            receiverId: UserStorage.getId(),
            ...queries,
            type: queries.type,
            lang: queries.lang || 'vi',
        });
    }

    async getNotificationByReceiverId(data: { receiverId: number; page?: number; perPage?: number; type?: string; lang: string }) {
        const { receiverId, page = 1, perPage = 10, type, lang } = data;
        const skip = (page - 1) * perPage;

        const match: any = {
            receiverId: receiverId,
            'details.lang': lang,
        };

        if (type) {
            match.type = type;
        }

        try {
            const notifications = await this.notificationModel
                .aggregate([
                    { $match: match },
                    {
                        $lookup: {
                            from: 'users', // Ensure 'users' collection exists and has documents with _id field matching senderId
                            localField: 'senderId',
                            foreignField: '_id',
                            as: 'sender',
                        },
                    },
                    { $unwind: { path: '$sender', preserveNullAndEmptyArrays: true } }, // Use preserveNullAndEmptyArrays to avoid unwind errors if sender not found
                    { $unwind: '$details' },
                    { $match: { 'details.lang': lang } }, // Filter details by lang again after unwind
                    { $sort: { isRead: 1, createdAt: -1 } },
                    { $skip: skip },
                    { $limit: perPage },
                    {
                        $project: {
                            _id: 1,
                            type: 1,
                            receiverId: 1,
                            link: 1,
                            entity: 1,
                            entityId: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            sender: { _id: 1, fullName: 1 },
                            'details.title': 1,
                            'details.content': 1,
                            'details.lang': 1,
                        },
                    },
                ])
                .exec();

            const total = await this.notificationModel.countDocuments({
                receiverId: receiverId,
                ...(type && { type }),
                'details.lang': lang,
            });

            const totalPages = Math.ceil(total / perPage);

            return {
                data: notifications,
                pagination: {
                    page,
                    perPage,
                    totalRecords: total,
                    totalPages: totalPages,
                },
            };
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    async findOne(id: string, lang: string = 'vi') {
        return this.notificationModel
            .findOne({
                _id: id,
                receiverId: UserStorage.getId(),
                'details.lang': lang,
            })
            .populate('sender', 'id fullName');
    }

    async countUnread() {
        const count = await this.notificationModel.countDocuments({
            receiverId: UserStorage.getId(),
            isRead: false,
        });

        return { count };
    }

    async markAsRead(notificationId: string) {
        if (!notificationId) return;
        return this.notificationModel.updateOne({ _id: notificationId, receiverId: UserStorage.getId() }, { $set: { isRead: true } });
    }

    async markAllAsRead() {
        return this.notificationModel.updateMany({ receiverId: UserStorage.getId() }, { $set: { isRead: true } });
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

        const notifications = data.receiverIds
            .filter((value, index, array) => array.indexOf(value) === index)
            .map((receiverId) => {
                const notification = new this.notificationModel({
                    entity: data.entity,
                    entityId: data.entityId,
                    senderId: data.senderId,
                    receiverId: receiverId,
                    type: data.type,
                    link: data.link,
                    isRead: false,
                    details: data.details.map((detail) => ({
                        lang: detail.lang,
                        title: detail.title,
                        content: detail.content,
                    })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                return notification;
            });

        if (notifications.length === 0) return;

        const savedNotifications = await this.notificationModel.insertMany(notifications);

        return savedNotifications;
    }
}
