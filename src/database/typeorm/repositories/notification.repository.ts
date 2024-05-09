/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationEntity } from '~/database/typeorm/entities/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<NotificationEntity> {
    constructor(private dataSource: DataSource) {
        super(NotificationEntity, dataSource.createEntityManager());
    }

    /**
     * The function retrieves notifications for a specific receiver, with pagination and language
     * filtering.
     * @param data - {
     * @returns an object with two properties: "data" and "pagination". The "data" property contains
     * the result of the query, which is an array of notification objects. The "pagination" property
     * contains information about the pagination of the query, including the current page, number of
     * records per page, total number of records, and total number of pages.
     */
    async getNotificationByReceiverId(data: { receiverId: number; page?: number; perPage?: number; type?: string; lang: string }) {
        const { receiverId, page = 1, perPage = 10 } = data;

        const query = this.createQueryBuilder('notification')
            .where('notification.receiverId = :receiverId', { receiverId })
            .orderBy('notification.isRead', 'ASC')
            .addOrderBy('notification.createdAt', 'DESC')
            .skip((page - 1) * perPage)
            .take(perPage)
            .leftJoinAndSelect('notification.sender', 'sender')
            .leftJoinAndSelect('notification.details', 'details')
            .andWhere('details.lang = :lang', { lang: data.lang });
        if (data.type) {
            query.andWhere('notification.type = :type', { type: data.type });
        }
        query.select(['notification', 'sender.id', 'sender.fullName', 'details.title', 'details.content', 'details.lang']);

        const [result, total] = await query.getManyAndCount();
        const totalPages = Math.ceil(total / perPage);

        return {
            data: result,
            pagination: {
                page,
                perPage,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }
}
