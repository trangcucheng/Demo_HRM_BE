import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { HUMAN_TIMESTAMP_FORMAT } from '~/common/constants/constant';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ORDER_TYPE_NAME, PROPOSAL_TYPE_NAME, WAREHOUSING_BILL_TYPE_NAME } from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class StatisticService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async productCategory() {
        const builder = this.database.productCategory.createQueryBuilder('productCategory');
        builder.select(['productCategory.name', 'COUNT(products.id) as count']);
        builder.leftJoin('productCategory.products', 'products');
        builder.groupBy('productCategory.id');

        return (await builder.getRawMany()).map((item) => ({
            name: item.productCategory_name,
            products: [Number(item.count)],
        }));
    }

    async warehouse() {
        const builder = this.database.warehouse.createQueryBuilder('warehouse');
        builder.select(['warehouse.name', 'COUNT(DISTINCT inventories.product_id) as products']);
        builder.leftJoin('warehouse.inventories', 'inventories');
        builder.leftJoin('inventories.product', 'product');
        builder.groupBy('warehouse.id');

        return (await builder.getRawMany()).map((item) => ({
            name: item.warehouse_name,
            products: [Number(item.products)],
        }));
    }

    async orderType() {
        const builder = this.database.order.createQueryBuilder('order');
        // group by type
        builder.select(['order.type', 'COUNT(order.id) as count']);
        builder.groupBy('order.type');
        return (await builder.getRawMany()).map((item) => ({
            type: ORDER_TYPE_NAME[item.order_type],
            count: [Number(item.count)],
        }));
    }

    async orderStatus() {
        const builder = this.database.order.createQueryBuilder('order');
        // group by status
        builder.select(['order.status', 'COUNT(order.id) as count']);
        builder.groupBy('order.status');
        return (await builder.getRawMany()).map((item) => ({
            status: item.order_status,
            count: [Number(item.count)],
        }));
    }

    async repairRequestStatus() {
        const builder = this.database.repairRequest.createQueryBuilder('repairRequest');
        builder.select(['repairRequest.status', 'COUNT(repairRequest.id) as count']);
        builder.groupBy('repairRequest.status');
        return (await builder.getRawMany()).map((item) => ({
            status: item.repairRequest_status,
            count: [Number(item.count)],
        }));
    }

    async proposalType() {
        const builder = this.database.proposal.createQueryBuilder('proposal');
        builder.select(['proposal.type', 'COUNT(proposal.id) as count']);
        builder.groupBy('proposal.type');
        return (await builder.getRawMany()).map((item) => ({
            type: PROPOSAL_TYPE_NAME[item.proposal_type],
            count: [Number(item.count)],
        }));
    }

    async proposalStatus() {
        const builder = this.database.proposal.createQueryBuilder('proposal');
        builder.select(['proposal.status', 'COUNT(proposal.id) as count']);
        builder.groupBy('proposal.status');
        return (await builder.getRawMany()).map((item) => ({
            status: item.proposal_status,
            count: [Number(item.count)],
        }));
    }

    async warehousingBillType(type?: string) {
        const builder = this.database.warehousingBill.createQueryBuilder('warehousingBill');
        builder.select(['warehousingBill.type', 'COUNT(warehousingBill.id) as count']);
        builder.groupBy('warehousingBill.type');
        if (type) builder.where('warehousingBill.type = :type', { type });
        return (await builder.getRawMany()).map((item) => ({
            type: WAREHOUSING_BILL_TYPE_NAME[item.warehousingBill_type],
            count: [Number(item.count)],
        }));
    }

    async warehousingBillStatus(type?: string) {
        const builder = this.database.warehousingBill.createQueryBuilder('warehousingBill');
        builder.select(['warehousingBill.status', 'warehousingBill.type', 'COUNT(warehousingBill.id) as count']);
        builder.groupBy('warehousingBill.status, warehousingBill.type');
        if (type) builder.where('warehousingBill.type = :type', { type });
        return (await builder.getRawMany()).map((item) => ({
            type: WAREHOUSING_BILL_TYPE_NAME[item.warehousingBill_type],
            status: item.warehousingBill_status,
            count: [Number(item.count)],
        }));
    }

    async product(warehouseId?: string) {
        const builder = this.database.product.createQueryBuilder('product');
        builder.select(['product.name', 'SUM(inventories.quantity) as quantity', 'inventories.warehouseId', 'warehouse.name']);
        builder.innerJoin('product.inventories', 'inventories');
        builder.innerJoin('inventories.warehouse', 'warehouse');
        builder.groupBy('product.id, inventories.warehouseId');
        if (warehouseId) builder.where('inventories.warehouseId = :warehouseId', { warehouseId });
        return (await builder.getRawMany()).map((item) => ({
            name: item.product_name,
            quantity: [Number(item.quantity)],
            warehouseId: item.inventories_warehouse_id,
            warehouseName: item.warehouse_name,
        }));
    }

    async expiredProduct(queries: FilterDto) {
        const page = Number(queries.page) || 1;
        const perPage = Number(queries.perPage) || 10;
        const offset = (page - 1) * perPage;

        const builder = this.database.product.createQueryBuilder('product');
        builder.select(['product.name', 'category.name', 'SUM(inventories.quantity) as quantity', 'inventories.expiredAt', 'warehouse.name']);
        builder.innerJoin('product.inventories', 'inventories');
        builder.innerJoin('product.category', 'category');
        builder.innerJoin('inventories.warehouse', 'warehouse');
        builder.where('inventories.expiredAt < :now', { now: new Date() });
        builder.groupBy('product.id');
        builder.limit(perPage);
        builder.offset(offset);

        const total = await builder.getCount();
        const totalPages = Math.ceil(total / perPage);

        return {
            data: (await builder.getRawMany()).map((item) => ({
                name: item.product_name,
                category: item.category_name,
                warehouse: item.warehouse_name,
                quantity: Number(item.quantity),
                expiredAt: moment(item.inventories_expired_at).format(HUMAN_TIMESTAMP_FORMAT),
            })),
            pagination: {
                page,
                perPage,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }
}
