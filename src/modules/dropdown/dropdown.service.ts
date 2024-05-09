import { Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '~/common/constants/constant';
import { FilterDto } from '~/common/dtos/filter.dto';
import {
    DAMAGE_LEVEL,
    DAMAGE_LEVEL_NAME,
    ORDER_STATUS,
    ORDER_TYPE,
    ORDER_TYPE_NAME,
    PROPOSAL_STATUS,
    PROPOSAL_TYPE,
    PROPOSAL_TYPE_NAME,
    REPAIR_REQUEST_STATUS,
    WAREHOUSING_BILL_TYPE,
    WAREHOUSING_BILL_TYPE_NAME,
} from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class DropdownService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async product(queries: FilterDto & { categoryId: number; code: string; barcode: string; warehouseId: number }) {
        // let condition = this.utilService.relationQuerySearch({ categoryId: queries.categoryId, code: queries.code, barcode: queries.barcode });
        // if (queries.warehouseId) {
        //     condition += queries.warehouseId;
        // }
        // return this.getDropdown({
        //     entity: 'product',
        //     queries,
        //     label: 'name',
        //     value: 'id',
        //     fulltext: false,
        //     andWhere: this.utilService.relationQuerySearch({ categoryId: queries.categoryId, code: queries.code, barcode: queries.barcode }),
        //     addSelect: ['code', 'barcode'],
        // });

        const take = Number(queries.perPage) || DEFAULT_PER_PAGE;
        const page = Number(queries.page) || DEFAULT_PAGE;
        const { builder, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.product, queries);
        builder.innerJoin('entity.category', 'category');
        builder.innerJoin('category.warehouse', 'warehouse');
        builder.select([
            `entity.id as value`,
            `entity.name as label`,
            'entity.code as code',
            'entity.barcode as barcode',
            'category.id as "categoryId"',
            'category.name as "categoryName"',
            'warehouse.id as "warehouseId"',
            'warehouse.name as "warehouseName"',
        ]);
        builder.addSelect(`COUNT(entity.id) OVER() AS total`);
        builder.limit(take);
        builder.offset(take * (page - 1));

        if (queries.search) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: ['name', 'code', 'barcode'], keyword: queries.search }));
        }
        if (queries.categoryId) {
            builder.andWhere('category.id = :categoryId', { categoryId: queries.categoryId });
        }
        if (queries.warehouseId) {
            builder.andWhere('warehouse.id = :warehouseId', { warehouseId: queries.warehouseId });
        }

        const result = await builder.getRawMany();
        const total = Number((await result)?.[0]?.['total'] || 0);
        const totalPages = Math.ceil(total / take);

        return {
            data: result.map((item) => ({
                ...item,
            })),
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    productCategory(queries: FilterDto) {
        return this.getDropdown({
            entity: 'productCategory',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    unit(queries: FilterDto) {
        return this.getDropdown({
            entity: 'unit',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    async proposal(
        queries: FilterDto & { type: PROPOSAL_TYPE; status: PROPOSAL_STATUS; isCreatedBill: boolean; isCreatedOrder: boolean; warehouseId: number },
    ) {
        // get order has not created warehousing bill
        let ids = queries.isCreatedBill
            ? (await this.database.warehousingBill.createQueryBuilder().select('proposal_id').getRawMany())
                  .map((item) => item.proposal_id)
                  .filter((item) => item)
            : [];
        ids = queries.isCreatedOrder ? [...ids, ...(await this.database.order.getProposalIds())] : ids;

        return this.getDropdown({
            entity: 'proposal',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
            andWhere: { ...this.utilService.getConditionsFromQuery(queries, ['type', 'status', 'warehouseId']), id: Not(In(ids)) },
        });
    }

    proposalType() {
        return Object.values(PROPOSAL_TYPE).map((item) => ({ value: item, label: PROPOSAL_TYPE_NAME[item] }));
    }

    warehouse(queries: FilterDto & { typeId: number }) {
        return this.getDropdown({
            entity: 'warehouse',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
            andWhere: this.utilService.relationQuerySearch({ typeId: queries.typeId }),
        });
    }

    async order(queries: FilterDto & { proposalId: string; status: ORDER_STATUS; isCreatedBill: boolean }) {
        // get order has not created warehousing bill
        const ids = queries.isCreatedBill
            ? (await this.database.warehousingBill.createQueryBuilder().select('order_id').getRawMany())
                  .map((item) => item.order_id)
                  .filter((item) => item)
            : [];

        return this.getDropdown({
            entity: 'order',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
            andWhere: { ...this.utilService.getConditionsFromQuery(queries, ['proposalId', 'status']), id: Not(In(ids)) },
        });
    }

    orderType() {
        return Object.values(ORDER_TYPE).map((item) => ({ value: item, label: ORDER_TYPE_NAME[item] }));
    }

    warehousingBillType() {
        return [
            ...Object.values(WAREHOUSING_BILL_TYPE).map((item) => ({ value: item, label: WAREHOUSING_BILL_TYPE_NAME[item] })),
            {
                value: 'EXPORT',
                label: 'Phiếu xuất kho (mìn)',
            },
        ];
    }

    user(queries: FilterDto & { fullName: string }) {
        return this.getDropdown({
            entity: 'user',
            queries,
            label: 'fullName',
            value: 'id',
            fulltext: false,
            relation: 'department',
        });
    }

    async repairRequest(queries: FilterDto & { repairById: number; status: REPAIR_REQUEST_STATUS; isCreatedBill: boolean; isCreatedOrder: boolean }) {
        // get order has not created warehousing bill
        let ids = queries.isCreatedBill
            ? (await this.database.warehousingBill.createQueryBuilder().select('repair_request_id').getRawMany())
                  .map((item) => item.repair_request_id)
                  .filter((item) => item)
            : [];
        ids = queries.isCreatedOrder ? [...ids, ...(await this.database.order.getRepairRequestIds())] : ids;

        return this.getDropdown({
            entity: 'repairRequest',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
            andWhere: { ...this.utilService.getConditionsFromQuery(queries, ['repairById', 'status']), id: Not(In(ids)) },
        });
    }

    vehicle(queries: FilterDto) {
        return this.getDropdown({
            entity: 'vehicle',
            queries,
            label: 'registrationNumber',
            value: 'id',
            fulltext: false,
        });
    }

    damageLevel() {
        return Object.values(DAMAGE_LEVEL).map((item) => ({ value: item, label: DAMAGE_LEVEL_NAME[item] }));
    }

    department(queries: FilterDto) {
        return this.getDropdown({
            entity: 'department',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    inventory(queries: FilterDto & { warehouseId: number }) {
        return this.getDropdown({
            entity: 'inventory',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
            andWhere: this.utilService.getConditionsFromQuery(queries, ['warehouseId']),
            relation: 'product',
            alias: 'product',
        });
    }

    role(queries: FilterDto) {
        return this.getDropdown({
            entity: 'role',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    async superior(queries: FilterDto & { departmentId: number }) {
        // get position level of current user
        let condition = '';
        if (!queries.departmentId) {
            condition = `position.level > (SELECT level FROM positions WHERE id = (SELECT position_id FROM users WHERE id = ${UserStorage.getId()}))`;
        } else {
            condition = `position.level > (SELECT level FROM positions WHERE id = (SELECT position_id FROM users WHERE id = ${UserStorage.getId()})) AND entity.department_id = ${
                queries.departmentId
            }`;
        }

        return this.getDropdown({
            entity: 'user',
            queries,
            label: 'fullName',
            value: 'id',
            fulltext: false,
            relation: 'position',
            andWhere: condition,
        });
    }

    async headOfDepartment(queries: FilterDto & { departmentId: number }) {
        // get position level of current user
        let condition = '';
        if (!queries.departmentId) {
            condition = `entity.id IN (SELECT users.id
                FROM users
                INNER JOIN departments ON departments.head_of_department_id = users.id
                )`;
        } else {
            condition = `entity.id IN (SELECT users.id
                FROM users
                INNER JOIN departments ON departments.head_of_department_id = users.id
                WHERE department_id = ${queries.departmentId}
                OR department_id IN (SELECT id
                    FROM departments
                    WHERE parent_id = ${queries.departmentId}
                ) )`;
        }

        return this.getDropdown({
            entity: 'user',
            queries,
            label: 'fullName',
            value: 'id',
            fulltext: false,
            relation: 'position',
            andWhere: condition,
        });
    }

    documentTypes() {
        return [
            { value: 'proposal', label: 'Yêu cầu cung cấp vật tư' },
            { value: 'order', label: 'Yêu cầu mua hàng' },
            { value: 'repairRequest', label: 'Yêu cầu sửa chữa' },
        ];
    }

    position(queries: FilterDto) {
        return this.getDropdown({
            entity: 'position',
            queries,
            label: 'name',
            value: 'id',
            fulltext: false,
        });
    }

    private async getDropdown(data: {
        entity: string;
        queries: FilterDto;
        label: string;
        value: string;
        fulltext: boolean;
        andWhere?: string | string[] | object;
        relation?: string;
        alias?: string;
        addSelect?: string[];
    }) {
        const alias = data.alias || 'entity';
        const take = Number(data.queries.perPage) || DEFAULT_PER_PAGE;
        const { builder, pagination } = this.utilService.getQueryBuilderAndPagination(this.database[data.entity], data.queries);
        builder.select([`${alias}.${data.value} as value`, `${alias}.${data.label} as label`]);
        builder.addSelect(`COUNT(entity.id) OVER() AS total`);

        builder.limit(take);
        builder.offset(take * ((Number(data.queries.page) || DEFAULT_PAGE) - 1));
        if (data.queries.search && data.fulltext) {
            builder.andWhere(this.utilService.fullTextSearch({ fields: [data.label], keyword: data.queries.search, entityAlias: alias }));
        }
        if (data.queries.search && !data.fulltext) {
            builder.andWhere(`${alias}.${data.label} LIKE :search`, { search: `%${data.queries.search}%` });
        }
        if (data.andWhere) {
            builder.andWhere(data.andWhere);
        }
        if (data.relation) {
            builder.leftJoinAndSelect(`entity.${data.relation}`, data.relation);
        }
        if (data.addSelect?.length) {
            data.addSelect.forEach((item) => {
                builder.addSelect(`${alias}.${item} as ${item}`);
            });
        }

        const result = await builder.getRawMany();
        const total = Number(result?.[0]?.['total'] || 0);
        const totalPages = Math.ceil(total / take);

        return {
            data: result?.map((item) => ({ ...item, value: item.value, label: item.label })),
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }
}
