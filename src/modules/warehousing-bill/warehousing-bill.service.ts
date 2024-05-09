import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';
import { In, IsNull, Like, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import {
    ORDER_STATUS,
    PROPOSAL_STATUS,
    PROPOSAL_TYPE,
    REPAIR_REQUEST_STATUS,
    WAREHOUSING_BILL_STATUS,
    WAREHOUSING_BILL_TYPE,
} from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { WarehousingBillEvent } from '~/modules/warehousing-bill/events/warehousing-bill.event';
import { UtilService } from '~/shared/services';
import { CreateWarehousingBillDto } from './dto/create-warehousing-bill.dto';
import { UpdateWarehousingBillDto } from './dto/update-warehousing-bill.dto';

@Injectable()
export class WarehousingBillService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createWarehousingBillDto: CreateWarehousingBillDto) {
        await this.validateCreate(createWarehousingBillDto);
        const entity = await this.database.warehousingBill.save(
            this.database.warehousingBill.create({
                ...createWarehousingBillDto,
                name: createWarehousingBillDto.name || `${createWarehousingBillDto.type}-${moment().format('YYYYMMDD:HHmmss')}`,
                createdById: UserStorage.getId(),
                code: `${createWarehousingBillDto.type}-${moment().unix()}`,
            }),
        );

        // this.createBillDetails(entity);
        this.emitEvent('warehousingBill.created', { id: entity.id });

        return entity;
    }

    async findAll(
        queries: FilterDto & {
            proposalId: number;
            repairRequestId: number;
            warehouseId: number;
            orderId: number;
            departmentId: string;
            type: WAREHOUSING_BILL_TYPE;
            status: WAREHOUSING_BILL_STATUS;
        },
    ) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehousingBill, queries);
        builder.andWhere(
            this.utilService.getConditionsFromQuery(queries, ['proposalId', 'repairRequestId', 'warehouseId', 'orderId', 'type', 'status']),
        );
        if (!this.utilService.isEmpty(queries.departmentId)) {
            builder.andWhere('warehouse.departmentId = :departmentId', { departmentId: queries.departmentId });
        }

        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.proposal', 'proposal');
        builder.leftJoinAndSelect('proposal.createdBy', 'proposalCreatedBy');
        builder.leftJoinAndSelect('entity.repairRequest', 'repairRequest');
        builder.leftJoinAndSelect('repairRequest.createdBy', 'repairRequestCreatedBy');
        builder.leftJoinAndSelect('entity.order', 'order');
        builder.leftJoinAndSelect('order.createdBy', 'orderCreatedBy');
        builder.select([
            'entity',
            'warehouse.id',
            'warehouse.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
            'proposal.id',
            'proposal.name',
            'proposalCreatedBy.id',
            'proposalCreatedBy.fullName',
            'repairRequest.id',
            'repairRequest.name',
            'repairRequestCreatedBy.id',
            'repairRequestCreatedBy.fullName',
            'order.id',
            'order.name',
            'orderCreatedBy.id',
            'orderCreatedBy.fullName',
        ]);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    findOne(id: number) {
        const builder = this.database.warehousingBill.createQueryBuilder('entity');
        builder.where({ id });
        builder.leftJoinAndSelect('entity.proposal', 'proposal');
        builder.leftJoinAndSelect('proposal.createdBy', 'proposalCreatedBy');
        builder.leftJoinAndSelect('entity.repairRequest', 'repairRequest');
        builder.leftJoinAndSelect('repairRequest.createdBy', 'repairRequestCreatedBy');
        builder.leftJoinAndSelect('entity.order', 'order');
        builder.leftJoinAndSelect('order.createdBy', 'orderCreatedBy');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('warehouse.department', 'whDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.select([
            'entity',
            'proposal.id',
            'proposal.name',
            'proposalCreatedBy.id',
            'proposalCreatedBy.fullName',
            'repairRequest.id',
            'repairRequest.name',
            'repairRequestCreatedBy.id',
            'repairRequestCreatedBy.fullName',
            'order.id',
            'order.name',
            'orderCreatedBy.id',
            'orderCreatedBy.fullName',
            'details.id',
            'details.productId',
            'details.proposalQuantity',
            'details.actualQuantity',
            'product.id',
            'product.name',
            'product.quantity',
            'unit.id',
            'unit.name',
            'warehouse.id',
            'warehouse.name',
            'whDepartment.id',
            'whDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
        ]);
        return builder.getOne();
    }

    async update(id: number, updateWarehousingBillDto: UpdateWarehousingBillDto) {
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        return this.database.warehousingBill.update(id, updateWarehousingBillDto);
    }

    async remove(id: number) {
        await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        await this.database.warehousingBillDetail.delete({ warehousingBillId: id });
        return this.database.warehousingBill.delete(id);
    }

    async getDetails(queries: FilterDto & { warehousingBillId: number; productId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehousingBillDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.warehousingBillId = :id', { id: queries.warehousingBillId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['productId']));
        builder.select(['entity', 'product.id', 'product.name', 'product.code', 'product.quantity', 'unit.id', 'unit.name']);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    async addDetail(warehousingBillId: number, detail: { productId: number; proposalQuantity: number }) {
        await this.isStatusValid({ id: warehousingBillId, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        await this.validateDetails([{ productId: detail.productId, proposalQuantity: detail.proposalQuantity }]);
        const newDetail = {
            warehousingBillId,
            productId: detail.productId,
            proposalQuantity: detail.proposalQuantity,
        };

        return this.database.warehousingBillDetail.save(this.database.warehousingBillDetail.create(newDetail));
    }

    async addDetails(warehousingBillId: number, details: { productId: number; proposalQuantity: number }[]) {
        await this.isStatusValid({ id: warehousingBillId, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        await this.validateDetails(details);
        const newDetails = details.map((detail) => ({
            warehousingBillId,
            productId: detail.productId,
            proposalQuantity: detail.proposalQuantity,
        }));

        const res = [];
        for (const newDetail of newDetails) {
            const created = await this.database.warehousingBillDetail.findOneBy({ warehousingBillId, productId: newDetail.productId });
            if (created) {
                await this.database.warehousingBillDetail.update(created.id, {
                    proposalQuantity: created.proposalQuantity + newDetail.proposalQuantity,
                });
                res.push(created);
            } else {
                res.push(await this.database.warehousingBillDetail.save(this.database.warehousingBillDetail.create(newDetail)));
            }
        }

        return res;
    }

    async updateDetail(warehousingBillId: number, detailId: number, update: { proposalQuantity?: number }) {
        await this.isStatusValid({ id: warehousingBillId, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        if (update.proposalQuantity <= 0) throw new HttpException('Số lượng yêu cầu không hợp lệ', 400);
        return this.database.warehousingBillDetail.update(detailId, update);
    }

    async removeDetail(warehousingBillId: number, detailId: number) {
        await this.isStatusValid({ id: warehousingBillId, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        return this.database.warehousingBillDetail.delete(detailId);
    }

    // async approve(id: number) {
    //     await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
    //     await this.database.warehousingBill.update(id, { status: WAREHOUSING_BILL_STATUS.APPROVED });
    //     await this.database.approvalProcess.save(
    //         this.database.approvalProcess.create({
    //             warehousingBillId: id,
    //             userId: UserStorage.getId(),
    //             from: PROPOSAL_STATUS.PENDING,
    //             to: PROPOSAL_STATUS.APPROVED,
    //         }),
    //     );

    //     // emit an event to notify that the warehousing bill is approved
    //     this.emitEvent('warehousingBill.approved', { id });

    //     return { message: 'Duyệt phiếu kho thành công', data: { id } };
    // }

    // async reject(id: number) {
    //     await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
    //     await this.database.warehousingBill.update(id, { status: WAREHOUSING_BILL_STATUS.REJECTED });
    //     await this.database.approvalProcess.save(
    //         this.database.approvalProcess.create({
    //             warehousingBillId: id,
    //             userId: UserStorage.getId(),
    //             from: PROPOSAL_STATUS.PENDING,
    //             to: PROPOSAL_STATUS.REJECTED,
    //         }),
    //     );

    //     // emit an event to notify that the warehousing bill is rejected
    //     this.emitEvent('warehousingBill.rejected', { id });

    //     return { message: 'Từ chối phiếu kho thành công', data: { id } };
    // }

    // async return(id: number) {
    //     await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.APPROVED], isTallied: true });
    //     await this.database.warehousingBill.update(id, { status: WAREHOUSING_BILL_STATUS.PENDING });
    //     await this.database.approvalProcess.save(
    //         this.database.approvalProcess.create({
    //             warehousingBillId: id,
    //             userId: UserStorage.getId(),
    //             from: PROPOSAL_STATUS.APPROVED,
    //             to: PROPOSAL_STATUS.PENDING,
    //         }),
    //     );

    //     // emit an event to notify that the warehousing bill is returned
    //     this.emitEvent('warehousingBill.returned', { id });

    //     return { message: 'Trả phiếu kho thành công', data: { id } };
    // }

    async finish(id: number) {
        const bill = await this.isStatusValid({ id, statuses: [WAREHOUSING_BILL_STATUS.PENDING] });
        const { result, nonTalliedProducts } = await this.isAllDetailsTallied(bill.id);
        if (!result) throw new HttpException('Còn sản phẩm chưa được kiểm đếm: ' + nonTalliedProducts.join(','), 400);

        await this.allDetailsTallied(bill);

        // emit an event to notify that the tallying process is completed
        this.emitEvent('warehousingBill.finished', { id });

        return { message: 'Kiểm phiếu kho hoàn tất', data: { id } };
    }

    /**
     * Only update the actual quantity of the warehousing bill detail \
     * If the status of the warehousing bill is not approved, throw an error \
     */
    async tally(billId: number, detailId: number, actualQuantity: number) {
        if (isNaN(actualQuantity)) throw new HttpException('Số lượng thực tế không hợp lệ', 400);
        const detail = await this.database.warehousingBillDetail.findOneBy({ id: detailId, warehousingBillId: billId });
        if (!detail) throw new HttpException('Không tìm thấy chi tiết phiếu kho', 404);
        // if (detail.actualQuantity) throw new HttpException('Chi tiết phiếu kho đã được nhập kho', 400);
        // if (actualQuantity > detail.proposalQuantity) throw new HttpException('Số lượng thực tế không được lớn hơn số lượng yêu cầu', 400);

        const bill = await this.database.warehousingBill.findOneBy({ id: detail.warehousingBillId });
        if (!bill) throw new HttpException('Không tìm thấy phiếu kho', 404);
        if (bill.status !== WAREHOUSING_BILL_STATUS.PENDING) throw new HttpException('Phiếu kho chưa được duyệt hoặc đã được kiểm đếm', 400);

        await this.database.warehousingBillDetail.update(detail.id, { actualQuantity });

        return { message: 'Kiểm đếm phiếu kho thành công', data: { ...detail, actualQuantity } };
    }

    async getApprovedRequests(queries: { id: number; entity: string; search: string }) {
        const { id, entity, search } = queries;
        switch (entity) {
            case 'proposal':
                // id, entity, name, content, status
                return this.getProposalRequests(id, search);
            case 'order':
                // id, entity, name, code, status
                return this.getOrderRequests(id, search);
            case 'repairRequest':
                // id, entity, name, description, status
                return this.getRepairRequests(id, search);
            default:
                return this.getAllRequests(id, search);
        }
    }

    private async validateCreate(createWarehousingBillDto: CreateWarehousingBillDto): Promise<void> {
        // can create warehousing bill from proposal, order, repair request or directly
        // if (!createWarehousingBillDto.proposalId && !createWarehousingBillDto.orderId && !createWarehousingBillDto.repairRequestId)
        //     throw new HttpException('Mã yêu cầu hoặc mã đơn hàng không được để trống', 400);

        if (
            (createWarehousingBillDto.proposalId && createWarehousingBillDto.orderId) ||
            (createWarehousingBillDto.proposalId && createWarehousingBillDto.repairRequestId) ||
            (createWarehousingBillDto.orderId && createWarehousingBillDto.repairRequestId)
        )
            throw new HttpException('Chỉ được chọn một trong ba loại phiếu', 400);

        if (createWarehousingBillDto.type === WAREHOUSING_BILL_TYPE.IMPORT) {
            // only import from proposal or order
            if (createWarehousingBillDto.proposalId) {
                await this.checkValidProposalType(createWarehousingBillDto.proposalId, createWarehousingBillDto.type);
            }

            if (createWarehousingBillDto.orderId) {
                await this.utilService.checkRelationIdExist({
                    order: {
                        id: createWarehousingBillDto.orderId,
                        status: ORDER_STATUS.APPROVED,
                        errorMessage: 'Không tìm thấy phiếu đặt hàng hoặc phiếu chưa được duyệt',
                    },
                });
            }

            if (createWarehousingBillDto.repairRequestId) {
                throw new HttpException('Không thể tạo phiếu nhập kho từ yêu cầu sửa chữa', 400);
            }
        }

        if (createWarehousingBillDto.type === WAREHOUSING_BILL_TYPE.EXPORT) {
            // only export from proposal has SUPPLY type or repair request
            if (createWarehousingBillDto.proposalId) {
                await this.checkValidProposalType(createWarehousingBillDto.proposalId, createWarehousingBillDto.type);
            }

            if (createWarehousingBillDto.orderId) {
                throw new HttpException('Không thể tạo phiếu xuất kho từ đơn mua hàng', 400);
            }

            if (createWarehousingBillDto.repairRequestId) {
                await this.utilService.checkRelationIdExist({
                    repairRequest: {
                        id: createWarehousingBillDto.repairRequestId,
                        status: REPAIR_REQUEST_STATUS.APPROVED,
                        errorMessage: 'Không tìm thấy yêu cầu sửa chữa hoặc yêu cầu chưa được duyệt',
                    },
                });
            }
        }

        await this.isQuantityValid(createWarehousingBillDto);
    }

    /**
     * Create warehousing bill details from proposal details
     * @param billEntity Warehousing bill entity
     */
    private async createBillDetails(billEntity: WarehousingBillEntity): Promise<void> {
        if (billEntity.proposalId) {
            const proposalDetails = await this.database.proposalDetail.getDetailByProposalId(billEntity.proposalId);
            const details = proposalDetails.map((detail) => ({
                warehousingBillId: billEntity.id,
                productId: detail.productId,
                proposalQuantity: detail.quantity,
            }));

            await this.database.warehousingBillDetail.save(this.database.warehousingBillDetail.create(details));
        }

        if (billEntity.repairRequestId) {
            const repairDetails = await this.database.repairDetail.getDetailByRequestId(billEntity.repairRequestId);
            const details = repairDetails.map((detail) => ({
                warehousingBillId: billEntity.id,
                productId: detail.productId,
                proposalQuantity: detail.quantity,
            }));

            await this.database.warehousingBillDetail.save(this.database.warehousingBillDetail.create(details));
        }

        if (billEntity.orderId) {
            const orderDetails = await this.database.orderItem.getDetailByOrderId(billEntity.orderId);
            const details = orderDetails.map((detail) => ({
                warehousingBillId: billEntity.id,
                productId: detail.productId,
                proposalQuantity: detail.quantity,
            }));

            await this.database.warehousingBillDetail.save(this.database.warehousingBillDetail.create(details));
        }
    }

    /**
     * Check if user can update or delete warehousing bills \
     * User must be the creator of the bills and the status must be the same as the one in the statuses array
     * @param id Warehousing bill id
     * @param statuses Array of valid statuses
     * @param userId (optional) Creator id
     * @returns Warehousing bill  entity
     */
    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; isTallied?: boolean }): Promise<WarehousingBillEntity> {
        const entity = await this.database.warehousingBill.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu kho', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa phiếu kho do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa yêu cầu này', 403);
        if (data.isTallied) {
            const details = await this.database.warehousingBillDetail.countBy({ warehousingBillId: data.id, actualQuantity: Not(IsNull()) });
            if (details > 0) throw new HttpException('Không thể chỉnh sửa phiếu kho do đã kiểm đếm', 400);
        }
        return entity;
    }

    /**
     * Check if all details of a warehousing bill are tallied
     * @param billId Warehousing bill id
     */
    private async isAllDetailsTallied(billId: number) {
        const details = await this.database.warehousingBillDetail.findBy({ warehousingBillId: billId });
        const nonTalliedDetails = details.filter((detail) => detail.actualQuantity === null);
        return { result: nonTalliedDetails.length === 0, nonTalliedProducts: nonTalliedDetails.map((detail) => detail?.productId) };
    }

    /**
     * The function `isQuantityValid` checks if the product quantities are enough for export
     * warehousing bills based on proposal or repair request details.
     * @param {CreateWarehousingBillDto} data - The `isQuantityValid` function is checking if the
     * quantity of products in a warehousing bill is valid based on the type of the bill (export or
     * import).
     */
    private async isQuantityValid(data: CreateWarehousingBillDto) {
        if (data.type === WAREHOUSING_BILL_TYPE.EXPORT) {
            const warehouse = await this.getWarehouseById(data.warehouseId);
            if (data.proposalId) {
                const proposalDetails = await this.getProposalDetails(data.proposalId);
                const productQuantitiesInDb = await this.getProductQuantitiesInDb(proposalDetails, data.warehouseId);

                this.checkIfProductQuantitiesAreEnough(proposalDetails, productQuantitiesInDb);
            }

            if (data.repairRequestId) {
                const items = await this.getRepairRequestDetails(data.repairRequestId);
                const productQuantitiesInDb = await this.getProductQuantitiesInDb(items, data.warehouseId);

                this.checkIfProductQuantitiesAreEnough(items, productQuantitiesInDb);
            }
        }
    }

    private async getWarehouseById(warehouseId: number) {
        const warehouse = await this.database.warehouse.findOneBy({ id: warehouseId });
        if (!warehouse) {
            throw new HttpException('Không tìm thấy kho', 404);
        }
        return warehouse;
    }

    private async getProposalDetails(proposalId: number): Promise<{ productId: number; productName: string; quantity: number }[]> {
        const proposalDetails = await this.database.proposalDetail.getDetailByProposalId(proposalId);
        if (proposalDetails.length === 0) {
            throw new HttpException('Không tìm thấy chi tiết yêu cầu', 400);
        }
        return proposalDetails;
    }

    private async getProductQuantitiesInDb(details: { productId: number; productName: string; quantity: number }[], warehouseId: number) {
        const productIds = details.map((detail) => detail.productId);
        const productQuantitiesInDb = await this.database.inventory.getQuantityByProductIds(productIds, warehouseId);
        if (productQuantitiesInDb.length === 0) {
            throw new HttpException(`Kho không có sản phẩm`, 400);
        }
        return productQuantitiesInDb;
    }

    private async getRepairRequestDetails(repairRequestId: number) {
        const items = await this.database.repairDetail.getDetailByRequestId(repairRequestId);
        if (items.length === 0) {
            throw new HttpException('Không tìm thấy chi tiết yêu cầu sửa chữa', 400);
        }
        return items;
    }

    private checkIfProductsExistInWarehouse(
        warehouse: WarehouseEntity,
        proposalDetails: { productId: number; productName: string; quantity: number }[],
        productQuantitiesInDb: { productId: number; productName: string; quantity: number }[],
    ) {
        const productsNotFound = proposalDetails.filter((detail) => !productQuantitiesInDb.some((product) => product.productId === detail.productId));
        if (productsNotFound.length > 0) {
            const productNames = productsNotFound.map((detail) => detail.productName).join(',');
            throw new HttpException(`Kho '${warehouse.name}' không có sản phẩm '${productNames}'`, 400);
        }
    }

    private checkIfProductQuantitiesAreEnough(
        details: { productId: number; productName: string; quantity: number }[],
        productQuantitiesInDb: { productId: number; productName: string; quantity: number }[],
    ) {
        const productQuantitiesNotEnough = productQuantitiesInDb.filter((productQuantity) => {
            const proposalDetail = details.find((detail) => detail.productId === productQuantity.productId);
            return productQuantity.quantity < (proposalDetail ? proposalDetail.quantity : 0);
        });
        if (productQuantitiesNotEnough.length > 0) {
            const errorMessage = productQuantitiesNotEnough
                .map((productQuantity) => {
                    const detail = details.find((detail) => detail.productId === productQuantity.productId);
                    return `(${productQuantity.productId}) ${productQuantity.productName} (tồn: ${productQuantity.quantity}, yêu cầu: ${
                        detail ? detail.quantity : 0
                    })`;
                })
                .join(',');
            throw new HttpException(`Số lượng sản phẩm ${errorMessage} không đủ. Vui lòng kiểm tra lại.`, 400);
        }
    }

    /**
     * Update the status of the warehousing bill and the proposal to completed \
     * Emit an event to notify that the tallying process is completed
     * @param billId Warehousing bill id
     * @param proposalId Proposal id
     * @returns Promise<void>
     * @emits tallying.completed
     */
    private async allDetailsTallied(bill: WarehousingBillEntity): Promise<void> {
        const { proposalId, orderId, repairRequestId } = bill;
        await this.database.warehousingBill.update(bill.id, { status: WAREHOUSING_BILL_STATUS.COMPLETED });
        this.database.approvalProcess.save(
            this.database.approvalProcess.create({
                warehousingBillId: bill.id,
                userId: UserStorage.getId(),
                from: WAREHOUSING_BILL_STATUS.PENDING,
                to: WAREHOUSING_BILL_STATUS.COMPLETED,
            }),
        );

        if (proposalId) {
            const proposal = await this.database.proposal.findOneBy({ id: proposalId });
            if (!proposal) throw new HttpException('Không tìm thấy đơn yêu cầu ' + proposalId, 400);
            await this.database.proposal.update(proposalId, { status: PROPOSAL_STATUS.COMPLETED });
            this.database.approvalProcess.save(
                this.database.approvalProcess.create({
                    proposalId: proposalId,
                    userId: UserStorage.getId(),
                    from: proposal.status,
                    to: PROPOSAL_STATUS.COMPLETED,
                }),
            );
        }

        if (orderId) {
            const order = await this.database.order.findOneBy({ id: orderId });
            if (!order) throw new HttpException('Không tìm thấy đơn hàng ' + orderId, 400);
            await this.database.order.update(orderId, { status: ORDER_STATUS.COMPLETED });
            this.database.orderProgressTracking.save({ orderId, status: ORDER_STATUS.COMPLETED, trackingDate: new Date() });
        }

        if (repairRequestId) {
            const repairRequest = await this.database.repairRequest.findOneBy({ id: repairRequestId });
            if (!repairRequest) throw new HttpException('Không tìm thấy yêu cầu sửa chữa ' + repairRequestId, 400);
            await this.database.repairRequest.update(repairRequestId, { status: REPAIR_REQUEST_STATUS.EXPORTED });
            this.database.repairProgress.save(
                this.database.repairProgress.create({
                    repairRequestId: repairRequest.id,
                    repairById: repairRequest.repairById,
                    status: REPAIR_REQUEST_STATUS.EXPORTED,
                    trackingDate: new Date(),
                }),
            );
        }

        this.updateInventory(bill.id);
    }

    /**
     * Update inventory when tallying completed \
     * It's not a good practice to call this function directly from controller, it will cause a lot of problems
     * @param warehousingBillId - Warehousing bill id
     * @returns void
     */
    private async updateInventory(warehousingBillId: number): Promise<void> {
        const bill = await this.getCompletedWarehousingBill(warehousingBillId);
        if (!bill) return;

        const billProducts = this.extractBillProducts(bill);

        const inventories = await this.findInventoriesByProductIds(billProducts.map((product) => product.productId));
        const { updatedInventories, newInventories } = this.updateOrCreateInventories(bill, billProducts, inventories);

        await Promise.all([this.database.inventory.save(updatedInventories), this.database.inventory.save(newInventories)]);
        // notify limits
        this.utilService.notifyLimits([...updatedInventories, ...newInventories]);

        const inventoryHistories = this.createInventoryHistories(bill, billProducts, updatedInventories, newInventories);
        await this.database.inventoryHistory.save(inventoryHistories);
    }

    private async getCompletedWarehousingBill(warehousingBillId: number) {
        return await this.database.warehousingBill.findOne({
            where: { id: warehousingBillId, status: WAREHOUSING_BILL_STATUS.COMPLETED },
            relations: ['details'],
        });
    }

    private extractBillProducts(bill: WarehousingBillEntity) {
        return bill.details.map((detail) => ({
            productId: detail.productId,
            actualQuantity: detail.actualQuantity,
        }));
    }

    private findInventoriesByProductIds(productIds: number[]) {
        return this.database.inventory.findBy({ productId: In(productIds) });
    }

    private updateOrCreateInventories(
        bill: WarehousingBillEntity,
        billProducts: { productId: number; actualQuantity: number }[],
        inventories: InventoryEntity[],
    ) {
        const updatedInventories: Partial<InventoryEntity>[] = [];
        const newInventories: Partial<InventoryEntity>[] = [];

        billProducts.forEach((billProduct) => {
            const inventory = inventories.find((inv) => inv.productId === billProduct.productId);
            const change = this.getChangeQuantity(bill.type, billProduct.actualQuantity);

            if (inventory) {
                updatedInventories.push({
                    ...inventory,
                    quantity: inventory.quantity + change,
                });
            } else {
                newInventories.push({
                    productId: billProduct.productId,
                    warehouseId: bill.warehouseId,
                    quantity: change,
                    createdById: UserStorage.getId(),
                });
            }
        });

        return { updatedInventories, newInventories };
    }

    private createInventoryHistories(
        bill: WarehousingBillEntity,
        billProducts: any[],
        updatedInventories: Partial<InventoryEntity>[],
        newInventories: Partial<InventoryEntity>[],
    ) {
        const inventoryHistories = [];

        billProducts.forEach((billProduct, index) => {
            const inventory =
                updatedInventories.find((inv) => inv.productId === billProduct.productId) ||
                newInventories.find((inv) => inv.productId === billProduct.productId);
            const change = this.getChangeQuantity(bill.type, billProduct.actualQuantity);
            inventoryHistories.push({
                inventoryId: inventory.id,
                from: inventory.quantity - change,
                to: inventory.quantity,
                change: change,
                updatedById: UserStorage.getId(),
                type: bill.type,
                note: JSON.stringify({ proposalId: bill.proposalId, warehousingBillId: bill.id }),
            });
        });

        return inventoryHistories;
    }

    private getChangeQuantity(billType: WAREHOUSING_BILL_TYPE, actualQuantity: number) {
        switch (billType) {
            case WAREHOUSING_BILL_TYPE.IMPORT:
                return actualQuantity;
            case WAREHOUSING_BILL_TYPE.EXPORT:
                return -actualQuantity;
        }
    }

    private async checkValidProposalType(proposalId: number, wbType: WAREHOUSING_BILL_TYPE) {
        // proposal with PURCHASE type, only create warehousing bill through order, can create warehousing bill when status is RECEIVED
        // proposal with SUPPLY type, can create warehousing bill when status is BOD_APPROVED
        const count = await this.database.warehousingBill.countBy({ proposalId });
        if (count > 0) throw new HttpException('Phiếu yêu cầu đã được tạo phiếu nhập kho', 400);

        const proposal = await this.database.proposal.findOneBy({ id: proposalId });
        if (!proposal) throw new HttpException('Không tìm thấy đơn yêu cầu', 400);

        const { type, status } = proposal;
        switch (type) {
            // case PROPOSAL_TYPE.PURCHASE:
            //     throw new HttpException('Không thể tạo phiếu nhập kho từ đơn yêu cầu mua hàng, chỉ có thể tạo từ đơn đặt hàng', 400);
            case PROPOSAL_TYPE.SUPPLY:
                if (status !== PROPOSAL_STATUS.APPROVED) {
                    throw new HttpException(`Đơn yêu cầu cung cấp vật tư chưa được duyệt`, 400);
                }
                if (wbType !== WAREHOUSING_BILL_TYPE.EXPORT) {
                    throw new HttpException(`Loại phiếu kho không hợp lệ, chỉ có thể tạo phiếu xuất kho từ đơn yêu cầu cung cấp vật tư`, 400);
                }
                break;
            default:
                throw new HttpException(`Loại đơn yêu cầu không hợp lệ (${type})`, 400);
        }
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new WarehousingBillEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async getProposalRequests(id: number, search: string) {
        const proposals = await this.database.proposal.find({
            // where: { id: id || undefined, type: PROPOSAL_TYPE.SUPPLY, status: PROPOSAL_STATUS.APPROVED, name: Like(`%${search}%`) },
            where: { id: id || undefined, type: PROPOSAL_TYPE.SUPPLY, status: PROPOSAL_STATUS.APPROVED, name: Like(`%${search}%`) },
            order: { id: 'DESC' },
        });

        return proposals.map((proposal) => ({
            id: proposal.id,
            entity: 'proposal',
            name: proposal.name,
            content: proposal.content,
            status: proposal.status,
            wbType: WAREHOUSING_BILL_TYPE.EXPORT,
        }));
    }

    private async getOrderRequests(id: number, search: string) {
        const orders = await this.database.order.find({
            where: { id: id || undefined, status: ORDER_STATUS.APPROVED, name: Like(`%${search}%`) },
            order: { id: 'DESC' },
        });

        return orders.map((order) => ({
            id: order.id,
            entity: 'order',
            name: order.name,
            content: order.code,
            status: order.status,
            wbType: WAREHOUSING_BILL_TYPE.IMPORT,
        }));
    }

    private async getRepairRequests(id: number, search: string) {
        const repairRequests = await this.database.repairRequest.find({
            where: { id: id || undefined, status: REPAIR_REQUEST_STATUS.APPROVED, name: Like(`%${search}%`) },
            order: { id: 'DESC' },
        });

        return repairRequests.map((repairRequest) => ({
            id: repairRequest.id,
            entity: 'repairRequest',
            name: repairRequest.name,
            content: repairRequest.description,
            status: repairRequest.status,
            wbType: WAREHOUSING_BILL_TYPE.EXPORT,
        }));
    }

    private async getAllRequests(id: number, search: string) {
        const whereId = id ? ` AND id = ${id}` : '';
        const whereSearch = search ? ` AND name LIKE '%${search}%'` : '';
        const results = await this.database.dataSource.query(
            `
            SELECT
                id,
                'proposal' as entity,
                name,
                content,
                status,
                'EXPORT' as wbType
            FROM proposals
            WHERE type = 'SUPPLY' AND status = 'BOD_APPROVED' ${whereId} ${whereSearch}
            UNION
            SELECT
                id,
                'order' as entity,
                name,
                code as content,
                status,
                'IMPORT' as wbType
            FROM orders
            WHERE status = 'BOD_APPROVED' ${whereId} ${whereSearch}
            UNION
            SELECT
                id,
                'repairRequest' as entity,
                name,
                description as content,
                status,
                'EXPORT' as wbType
            FROM repair_requests
            WHERE status = 'BOD_APPROVED' ${whereId} ${whereSearch}
            `,
        );
        return results;
    }

    private async validateDetails(details: { productId: number; proposalQuantity: number }[]) {
        if (details.length === 0) throw new HttpException('Chi tiết phiếu không được để trống', 400);
        if (details.some((detail) => isNaN(detail.proposalQuantity))) throw new HttpException('Số lượng yêu cầu không hợp lệ', 400);
        if (details.some((detail) => detail.proposalQuantity <= 0)) throw new HttpException('Số lượng yêu cầu không được nhỏ hoặc bằng 0', 400);

        const productIds = details.map((detail) => detail.productId);
        const products = await this.database.product.find({ where: { id: In(productIds) } });
        const productsNotFound = details.filter((detail) => !products.some((product) => product.id === detail.productId));
        if (productsNotFound.length > 0) {
            const productNames = productsNotFound.map((detail) => detail.productId).join(', ');
            throw new HttpException(`Không tìm thấy sản phẩm ${productNames}`, 400);
        }
    }
}
