/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';

@Injectable()
export class OrderItemRepository extends Repository<OrderItemEntity> {
    constructor(private dataSource: DataSource) {
        super(OrderItemEntity, dataSource.createEntityManager());
    }

    getDetailByOrderId(orderId: number): Promise<{ productId: number; productName: string; quantity: number }[]> {
        return this.createQueryBuilder('item')
            .leftJoin('item.product', 'product')
            .select('item.productId', 'productId')
            .addSelect('item.quantity', 'quantity')
            .addSelect('product.name', 'productName')
            .where('item.orderId = :orderId', { orderId })
            .getRawMany();
    }
}
