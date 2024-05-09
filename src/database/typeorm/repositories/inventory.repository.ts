/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { DataSource, Repository } from 'typeorm';
import { UserStorage } from '~/common/storages/user.storage';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';

@Injectable()
export class InventoryRepository extends Repository<InventoryEntity> {
    constructor(private dataSource: DataSource) {
        super(InventoryEntity, dataSource.createEntityManager());
    }

    async getQuantityByProductId(productId: number): Promise<number> {
        const result = await this.createQueryBuilder('inventory')
            .select('SUM(inventory.quantity)', 'quantity')
            .where('inventory.productId = :productId', { productId })
            .getRawOne();

        return Number(result.quantity) || 0;
    }

    async getQuantityByProductIds(
        productIds: number[],
        warehouseId?: number,
    ): Promise<{ productId: number; quantity: number; productName: string }[]> {
        const builder = this.createQueryBuilder('inventory')
            .leftJoin('inventory.product', 'product')
            .select('inventory.productId', 'productId')
            .addSelect('SUM(inventory.quantity)', 'quantity')
            .addSelect('product.name', 'productName')
            .where('inventory.productId IN (:...productIds)', { productIds })
            .groupBy('inventory.productId');

        if (warehouseId) {
            builder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
        }

        const result = await builder.getRawMany();
        return result.map((item) => ({ ...item, quantity: Number(item.quantity) || 0 }));
    }

    async getQuantity(productId: number, warehouseId: number): Promise<number> {
        const result = await this.createQueryBuilder('inventory')
            .select('inventory.quantity', 'quantity')
            .where('inventory.productId = :productId', { productId })
            .andWhere('inventory.warehouseId = :warehouseId', { warehouseId })
            .getRawOne();

        return Number(result.quantity) || 0;
    }

    getOpeningQuantities(warehouseId: number, startDate: Date, endDate: Date): Promise<{ productId: number; current: string; opening: string }[]> {
        const builder = this.createQueryBuilder('entity')
            .leftJoin('entity.histories', 'histories', 'histories.createdAt BETWEEN :startDate AND :endDate', {
                startDate: moment(startDate).format('YYYY-MM-DD'),
                endDate: moment(endDate).format('YYYY-MM-DD'),
            })
            .where('entity.warehouseId = :warehouseId', { warehouseId })
            .select(['entity.productId as productId', 'entity.quantity as current', 'histories.from as opening'])
            .groupBy('entity.productId');

        return builder.getRawMany();
    }

    async getOpeningQuantity(warehouseId: number, productId: number, startDate: Date, endDate: Date): Promise<{ current: number; opening: number }> {
        const builder = this.createQueryBuilder('entity')
            .leftJoin('entity.histories', 'histories', 'histories.createdAt BETWEEN :startDate AND :endDate', {
                startDate: moment(startDate).format('YYYY-MM-DD'),
                endDate: moment(endDate).format('YYYY-MM-DD'),
            })
            .where('entity.warehouseId = :warehouseId', { warehouseId })
            .andWhere('entity.productId = :productId', { productId })
            .select(['entity.quantity as current', 'histories.from as opening']);

        const res = builder.getRawOne();

        return {
            current: parseFloat(res['current']) || 0,
            opening: parseFloat(res['opening']) || 0,
        };
    }

    async increaseQuantity(productId: number, warehouseId: number, amount: number): Promise<boolean> {
        // const res = await this.createQueryBuilder('inventory')
        //     .update()
        //     .set({ quantity: () => `quantity + ${amount}` })
        //     .where('productId = :productId', { productId })
        //     .andWhere('warehouseId = :warehouseId', { warehouseId })
        //     .execute();

        const res = await this.increment({ productId, warehouseId }, 'quantity', amount);

        if (res.affected > 0) {
            this.writeHistory(productId, warehouseId, amount, 'increase', 'Increase quantity');
            return true;
        }

        return false;
    }

    async decreaseQuantity(productId: number, warehouseId: number, amount: number): Promise<boolean> {
        // const res = await this.createQueryBuilder('inventory')
        //     .update()
        //     .set({ quantity: () => `quantity - ${amount}` })
        //     .where('productId = :productId', { productId })
        //     .andWhere('warehouseId = :warehouseId', { warehouseId })
        //     .execute();

        const res = await this.decrement({ productId, warehouseId }, 'quantity', amount);

        if (res.affected > 0) {
            this.writeHistory(productId, warehouseId, amount, 'decrease', 'Decrease quantity');
            return true;
        }

        return false;
    }

    private async writeHistory(productId: number, warehouseId: number, change: number, type: string, note: string) {
        const invetory = await this.findOneBy({ productId, warehouseId });
        if (invetory) {
            this.dataSource.getRepository(InventoryHistoryEntity).save({
                inventoryId: invetory.id,
                from: invetory.quantity - change,
                to: invetory.quantity,
                change,
                note,
                updatedById: UserStorage.getId(),
                type,
            });
        }
    }

    async getExpiredProducts(): Promise<
        { productId: number; productName: string; warehouseId: number; warehouseName: string; warehouseDepartmentId: number; expiredAt: Date }[]
    > {
        // get interval from field notify_before
        const products = await this.query(`
        SELECT p.id as productId, p.name as productName, w.id as warehouseId, w.name as warehouseName, w.department_id as warehouseDepartmentId, i.expired_at as expiredAt
        FROM inventory as i, products as p, warehouses as w
        WHERE i.product_id = p.id
            AND i.warehouse_id = w.id
            AND i.expired_at IS NOT NULL
            AND i.expired_at <= DATE_ADD(NOW(), INTERVAL (i.notify_before) DAY)
            AND i.expired_at >= NOW()
        `);

        return products;
    }
}
