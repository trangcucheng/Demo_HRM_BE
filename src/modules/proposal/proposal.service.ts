import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { In, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { APPROVAL_ACTION, PROPOSAL_STATUS, PROPOSAL_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { CreateProposalDetailDto, CreateProposalDetailsDto } from '~/modules/proposal/dto/create-proposal-detail.dto';
import { UpdateProposalDetailDto } from '~/modules/proposal/dto/update-proposal-detail.dto';
import { ProposalEvent } from '~/modules/proposal/events/proposal.event';
import { UtilService } from '~/shared/services';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createProposalDto: CreateProposalDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? PROPOSAL_STATUS.APPROVED : PROPOSAL_STATUS.DRAFT;
        const proposal = await this.database.proposal.save(
            this.database.proposal.create({ ...createProposalDto, createdById: UserStorage.getId(), status }),
        );
        this.emitEvent('proposal.created', { id: proposal.id });
        return proposal;
    }

    async findAll(queries: FilterDto & { type: PROPOSAL_TYPE; status: PROPOSAL_STATUS; warehouseId: number; departmentId: string }) {
        return this.utilService.getList({
            repository: this.database.proposal,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['type', 'status', 'warehouseId']));
                if (!this.utilService.isEmpty(queries.departmentId)) {
                    builder.andWhere('entity.departmentId IN (:...departmentId)', { departmentId: queries.departmentId.split(',') });
                }

                const conditions = await this.utilService.accessControl('proposal');
                builder.andWhere(conditions.creatorCondition);
                if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);

                builder.leftJoinAndSelect('entity.department', 'department');
                builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
                builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
                builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
                builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
                builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
                builder.select([
                    'entity',
                    'department.id',
                    'department.name',
                    'createdBy.id',
                    'createdBy.fullName',
                    'cbDepartment.id',
                    'cbDepartment.name',
                    'updatedBy.id',
                    'updatedBy.fullName',
                    'ubDepartment.id',
                    'ubDepartment.name',
                    'warehouse.id',
                    'warehouse.name',
                ]);
            },
        });
    }

    findOne(id: number) {
        const builder = this.database.proposal.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.department', 'department');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'proposal',
        });
        builder.leftJoinAndMapOne('ah.approver', UserEntity, 'approver', 'approver.id = ah.approverId');
        builder.leftJoinAndSelect('entity.currentApprover', 'currentApprover');

        builder.where('entity.id = :id', { id });
        builder.select([
            'entity',
            'department.id',
            'department.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
            'details.id',
            'details.productId',
            'details.quantity',
            'details.note',
            'product.id',
            'product.name',
            'product.quantity',
            'unit.id',
            'unit.name',
            'warehouse.id',
            'warehouse.name',
            'ah.id',
            'ah.approverId',
            'ah.step',
            'ah.action',
            'ah.comment',
            'ah.status',
            'ah.submittedAt',
            'approver.id',
            'approver.fullName',
            'currentApprover.id',
            'currentApprover.fullName',
        ]);

        return builder.getOne();
    }

    async update(id: number, updateProposalDto: UpdateProposalDto) {
        await this.isProposalStatusValid({
            id,
            statuses: [PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        if (!Object.keys(PROPOSAL_TYPE).includes(updateProposalDto.type)) throw new HttpException('Loại yêu cầu không hợp lệ', 400);

        return this.database.proposal.update(id, {
            ...updateProposalDto,
            updatedById: UserStorage.getId(),
            status: PROPOSAL_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isProposalStatusValid({
            id,
            statuses: [PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.proposalDetail.delete({ proposalId: id });
        return this.database.proposal.delete(id);
    }

    async submit(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [PROPOSAL_STATUS.DRAFT],
            to: PROPOSAL_STATUS.PENDING,
            userId: UserStorage.getId(),
            nextApproverId: dto.approverId,
            action: APPROVAL_ACTION.SUBMIT,
            comment: dto.comment,
        });

        this.emitEvent('proposal.pending', { id });
        return { message: 'Đã trình yêu cầu', data: { id } };
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [PROPOSAL_STATUS.PENDING, PROPOSAL_STATUS.IN_PROGRESS],
            to: PROPOSAL_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        // Notify user who can create warehousing bill
        // maybe use a table to store who can receive notification when a proposal is approved
        // or send notification to all users who have permission to create warehousing bill (fastest way)
        this.emitEvent('proposal.approved', { id });

        return { message: 'Đã duyệt yêu cầu', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [PROPOSAL_STATUS.PENDING, PROPOSAL_STATUS.IN_PROGRESS],
            to: PROPOSAL_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        // Notify creator of this proposal
        this.emitEvent('proposal.rejected', { id });

        return { message: 'Đã từ chối yêu cầu', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [PROPOSAL_STATUS.PENDING, PROPOSAL_STATUS.IN_PROGRESS],
            to: PROPOSAL_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        // Notify user who can create warehousing bill
        // maybe use a table to store who can receive notification when a proposal is approved
        // or send notification to all users who have permission to create warehousing bill (fastest way)
        this.emitEvent('proposal.forwarded', { id });

        return { message: 'Đã chuyển yêu cầu', data: { id } };
    }

    // async return(id: number, comment: string) {
    //     await this.updateStatus({
    //         id,
    //         from: PROPOSAL_STATUS.APPROVED,
    //         to: PROPOSAL_STATUS.DRAFT,
    //         comment,
    //         checkIfBillCreated: true,
    //     });

    //     // Notify creator of this proposal
    //     this.emitEvent('proposal.returned', { id });

    //     return { message: 'Đã trả lại yêu cầu', data: { id } };
    // }

    async getDetails(queries: FilterDto & { proposalId: number; productId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.proposalDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['product.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.andWhere('entity.proposalId = :id', { id: queries.proposalId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['productId']));
        builder.select(['entity', 'product.id', 'product.name', 'product.quantity', 'unit.id', 'unit.name']);

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

    async addDetail(id: number, detail: CreateProposalDetailDto) {
        const proposal = await this.isProposalStatusValid({
            id,
            statuses: [
                PROPOSAL_STATUS.DRAFT,
                PROPOSAL_STATUS.PENDING,
                // PROPOSAL_STATUS.HEAD_REJECTED,
                // PROPOSAL_STATUS.MANAGER_REJECTED,
                // PROPOSAL_STATUS.ADMINISTRATIVE_REJECTED,
                // PROPOSAL_STATUS.BOD_REJECTED,
                PROPOSAL_STATUS.REJECTED,
            ],
        });
        // if (proposal.type === PROPOSAL_TYPE.PURCHASE && (detail.price === null || detail.price === undefined)) {
        //     throw new HttpException('Giá sản phẩm không được để trống', 400);
        // }
        await this.verifyDetail(id, detail);
        return this.database.proposalDetail.save(this.database.proposalDetail.create({ ...detail, proposalId: id }));
    }

    async addDetails(id: number, dto: CreateProposalDetailsDto) {
        const proposal = await this.isProposalStatusValid({
            id,
            statuses: [
                PROPOSAL_STATUS.DRAFT,
                PROPOSAL_STATUS.PENDING,
                // PROPOSAL_STATUS.HEAD_REJECTED,
                // PROPOSAL_STATUS.MANAGER_REJECTED,
                // PROPOSAL_STATUS.ADMINISTRATIVE_REJECTED,
                // PROPOSAL_STATUS.BOD_REJECTED,
                PROPOSAL_STATUS.REJECTED,
            ],
        });
        // if (proposal.type === PROPOSAL_TYPE.PURCHASE) {
        //     for (const detail of dto.details) {
        //         if (detail.price === null || detail.price === undefined) {
        //             throw new HttpException('Giá sản phẩm không được để trống', 400);
        //         }
        //     }
        // }
        await this.verifyDetails(id, dto.details);
        return this.database.proposalDetail.save(dto.details.map((detail) => ({ ...detail, proposalId: id })));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateProposalDetailDto) {
        const proposal = await this.isProposalStatusValid({
            id,
            statuses: [
                PROPOSAL_STATUS.DRAFT,
                PROPOSAL_STATUS.PENDING,
                // PROPOSAL_STATUS.HEAD_REJECTED,
                // PROPOSAL_STATUS.MANAGER_REJECTED,
                // PROPOSAL_STATUS.ADMINISTRATIVE_REJECTED,
                // PROPOSAL_STATUS.BOD_REJECTED,
                PROPOSAL_STATUS.REJECTED,
            ],
        });
        // if (proposal.type === PROPOSAL_TYPE.PURCHASE && (detail.price === null || detail.price === undefined)) {
        //     throw new HttpException('Giá sản phẩm không được để trống', 400);
        // }
        await this.verifyDetail(id, detail, detailId);
        return this.database.proposalDetail.update({ id: detailId, proposalId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isProposalStatusValid({
            id,
            statuses: [
                PROPOSAL_STATUS.DRAFT,
                PROPOSAL_STATUS.PENDING,
                // PROPOSAL_STATUS.HEAD_REJECTED,
                // PROPOSAL_STATUS.MANAGER_REJECTED,
                // PROPOSAL_STATUS.ADMINISTRATIVE_REJECTED,
                // PROPOSAL_STATUS.BOD_REJECTED,
                PROPOSAL_STATUS.REJECTED,
            ],
        });
        await this.database.proposalDetail.delete({ id: detailId, proposalId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }

    /**
     * Check if user can update or delete proposal \
     * User must be the creator of the proposal and the status must be the same as the one in the statuses array
     * @param id proposal id
     * @param statuses array of valid statuses
     * @param userId (optional) creator id
     * @param checkIfBillCreated (optional) check if warehousing bill is created
     * @returns proposal entity
     */
    private async isProposalStatusValid(data: {
        id: number;
        statuses: any[];
        userId?: number;
        checkIfBillCreated?: boolean;
        currentApproverId?: number;
    }): Promise<ProposalEntity> {
        const entity = await this.database.proposal.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy yêu cầu', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa yêu cầu do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa yêu cầu này', 403);
        if (data.checkIfBillCreated) {
            const order = await this.database.order.isProposalAdded(data.id, null);
            if (order) throw new HttpException('Không thể chỉnh sửa yêu cầu do đơn hàng đã được tạo', 400);

            const bill = await this.database.warehousingBill.countBy({ proposalId: data.id });
            if (bill) throw new HttpException('Không thể chỉnh sửa yêu cầu do phiếu kho đã được tạo', 400);
        }
        if (data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt yêu cầu này', 403);
        }

        return entity;
    }

    private async verifyDetails(proposalId: number, details: { productId: number; quantity: number; note?: string }[]) {
        const productIds = details.map((detail) => detail.productId).filter((productId) => productId);
        const productQuantities = details.map((detail) => detail.quantity).filter((quantity) => quantity);
        if (productIds.length === 0) throw new HttpException('Sản phẩm không được để trống', 400);
        if (productQuantities.length === 0) throw new HttpException('Số lượng không được để trống', 400);
        if (productIds.length !== productQuantities.length) throw new HttpException('Số lượng sản phẩm không hợp lệ', 400);

        const products = await this.database.product.find({ select: ['id'], where: { id: In(productIds) } });
        const productIdsInDb = products.map((product) => product.id);
        const productIdsNotInDb = productIds.filter((productId) => !productIdsInDb.includes(productId));
        if (productIdsNotInDb.length > 0) throw new HttpException(`Sản phẩm ${productIdsNotInDb.join(',')} không tồn tại`, 400);

        if (proposalId) {
            const isDuplicate = await this.database.proposalDetail.findOneBy({ proposalId, productId: In(productIds) });
            if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào yêu cầu', 400);
        }
    }

    private async verifyDetail(proposalId: number, detail: { productId?: number; quantity?: number; note?: string }, detailId?: number) {
        if (detail?.productId) {
            const isDuplicate = await this.database.proposalDetail.findOneBy({
                proposalId,
                productId: detail.productId,
                id: detailId ? Not(detailId) : undefined,
            });
            if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào yêu cầu', 400);
        }
    }

    private async updateStatus(data: {
        id: number;
        from: PROPOSAL_STATUS[];
        to: PROPOSAL_STATUS;
        comment?: string;
        checkIfBillCreated?: boolean;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển yêu cầu cho chính mình', 400);

        await this.isProposalStatusValid({
            id: data.id,
            statuses: data.from,
            checkIfBillCreated: data.checkIfBillCreated,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover = [APPROVAL_ACTION.APPROVE, APPROVAL_ACTION.REJECT].includes(data.action) ? null : data.nextApproverId;
        await this.database.proposal.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('proposal', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'proposal',
                entityId: data.id,
                approverId: UserStorage.getId(),
                action: data.action,
                comment: data.comment,
                status: data.to,
                step: step,
                submittedAt: new Date(),
            }),
        );
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new ProposalEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }
}
