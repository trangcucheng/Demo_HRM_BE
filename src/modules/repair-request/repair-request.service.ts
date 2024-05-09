import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';
import { In, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { APPROVAL_ACTION, REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { CreateRepairDetailDto, CreateRepairDetailsDto } from '~/modules/repair-request/dto/create-repair-detail.dto';
import { UpdateRepairDetailDto } from '~/modules/repair-request/dto/update-repair-detail.dto';
import { RepairRequestEvent } from '~/modules/repair-request/events/repair-request.event';
import { UtilService } from '~/shared/services';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';

@Injectable()
export class RepairRequestService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    async create(createRepairRequestDto: CreateRepairRequestDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? REPAIR_REQUEST_STATUS.APPROVED : REPAIR_REQUEST_STATUS.DRAFT;
        const { vehicleRegistrationNumber, imageIds, ...rest } = createRepairRequestDto;
        const registrationNumber = vehicleRegistrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const vehicle = await this.database.vehicle.findOrCreate(registrationNumber);
        const entity = await this.database.repairRequest.save(
            this.database.repairRequest.create({
                ...rest,
                name: `[${registrationNumber}] ${moment().unix()}`,
                vehicleId: vehicle.id,
                startDate: new Date(),
                createdById: UserStorage.getId(),
                status,
            }),
        );
        this.database.repairRequest.addImages(entity.id, imageIds);

        // notify to garage or head of department
        this.emitEvent('repairRequest.created', { id: entity.id });

        return entity;
    }

    async findAll(queries: FilterDto & { repairById: number; status: string; departmentId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairRequest, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['repairById', 'status']));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name', 'vehicle.registrationNumber'], keyword: queries.search }));
        if (!this.utilService.isEmpty(queries.departmentId)) {
            builder.andWhere('createdBy.departmentId = :departmentId', { departmentId: queries.departmentId });
        }

        const conditions = await this.utilService.accessControl('repairRequest');
        builder.andWhere(conditions.creatorCondition);
        if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);

        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('vehicle.user', 'vehicleUser');
        builder.leftJoinAndSelect('vehicleUser.department', 'vuDepartment');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('repairBy.department', 'rbDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'vehicleUser.id',
            'vehicleUser.fullName',
            'vuDepartment.id',
            'vuDepartment.name',
            'repairBy.id',
            'repairBy.fullName',
            'rbDepartment.id',
            'rbDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
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
        const builder = this.database.repairRequest.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('vehicle.user', 'vehicleUser');
        builder.leftJoinAndSelect('vehicleUser.department', 'vuDepartment');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.replacementPart', 'replacementPart');
        builder.leftJoinAndSelect('entity.progresses', 'progresses');
        builder.leftJoinAndSelect('progresses.repairBy', 'progressRepairBy');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('repairBy.department', 'rbDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.images', 'images');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'repairRequest',
        });
        builder.leftJoinAndMapOne('ah.approver', UserEntity, 'approver', 'approver.id = ah.approverId');
        builder.leftJoinAndSelect('entity.currentApprover', 'currentApprover');

        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'vehicleUser.id',
            'vehicleUser.fullName',
            'vuDepartment.id',
            'vuDepartment.name',
            'details',
            'replacementPart.id',
            'replacementPart.name',
            'replacementPart.quantity',
            'progresses',
            'progressRepairBy.id',
            'progressRepairBy.fullName',
            'repairBy.id',
            'repairBy.fullName',
            'rbDepartment.id',
            'rbDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'images.id',
            'images.name',
            'images.path',
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

        builder.where({ id });
        return builder.getOne();
    }

    async update(id: number, updateRepairRequestDto: UpdateRepairRequestDto) {
        await this.isStatusValid({
            id,
            statuses: [REPAIR_REQUEST_STATUS.DRAFT, REPAIR_REQUEST_STATUS.REJECTED],
        });

        const { vehicleRegistrationNumber, imageIds, ...rest } = updateRepairRequestDto;
        const addUpdate = {};
        if (vehicleRegistrationNumber) {
            const registrationNumber = vehicleRegistrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const vehicle = await this.database.vehicle.findOrCreate(registrationNumber);
            addUpdate['vehicleId'] = vehicle.id;
        }

        if (!this.utilService.isEmpty(imageIds)) {
            await this.database.repairRequest.removeAllImages(id);
            this.database.repairRequest.addImages(id, imageIds);
        }

        return this.database.repairRequest.update(id, { ...rest, ...addUpdate, status: REPAIR_REQUEST_STATUS.IN_PROGRESS });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [REPAIR_REQUEST_STATUS.DRAFT, REPAIR_REQUEST_STATUS.REJECTED],
        });
        this.database.repairDetail.delete({ repairRequestId: id });
        this.database.repairRequest.removeAllImages(id);
        this.database.repairProgress.delete({ repairRequestId: id });
        return this.database.repairRequest.delete(id);
    }

    submit(id: number, dto: NextApproverDto) {
        return this.processApproval({
            id,
            action: APPROVAL_ACTION.SUBMIT,
            mustHaveStatuses: [REPAIR_REQUEST_STATUS.DRAFT],
            toStatus: REPAIR_REQUEST_STATUS.PENDING,
            event: 'repairRequest.pending',
            approverId: dto.approverId,
            comment: dto.comment,
            currentUserId: UserStorage.getId(),
        });
    }

    async forward(id: number, dto: NextApproverDto) {
        return this.processApproval({
            id,
            action: APPROVAL_ACTION.FORWARD,
            mustHaveStatuses: [REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.IN_PROGRESS],
            toStatus: REPAIR_REQUEST_STATUS.IN_PROGRESS,
            event: 'repairRequest.forwarded',
            approverId: dto.approverId,
            comment: dto.comment,
            currentUserId: UserStorage.getId(),
        });
    }

    async approve(id: number) {
        return this.processApproval({
            id,
            action: APPROVAL_ACTION.APPROVE,
            mustHaveStatuses: [REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.IN_PROGRESS],
            toStatus: REPAIR_REQUEST_STATUS.APPROVED,
            event: 'repairRequest.approved',
            approverId: null,
            comment: null,
            currentUserId: UserStorage.getId(),
        });
    }

    async reject(id: number, comment: string) {
        return this.processApproval({
            id,
            action: APPROVAL_ACTION.REJECT,
            mustHaveStatuses: [REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.IN_PROGRESS],
            toStatus: REPAIR_REQUEST_STATUS.REJECTED,
            event: 'repairRequest.rejected',
            approverId: null,
            comment: comment,
            currentUserId: UserStorage.getId(),
        });
    }

    async getDetails(queries: FilterDto & { requestId: number; replacementPartId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['replacementPart.name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.replacementPart', 'replacementPart');
        builder.leftJoinAndSelect('replacementPart.unit', 'unit');
        builder.andWhere('entity.repairRequestId = :id', { id: queries.requestId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['replacementPartId']));
        builder.select(['entity', 'replacementPart.id', 'replacementPart.name', 'replacementPart.quantity', 'unit.id', 'unit.name']);

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

    async addDetail(id: number, data: CreateRepairDetailDto) {
        await this.isStatusValid({
            id,
            statuses: [REPAIR_REQUEST_STATUS.DRAFT, REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.REJECTED],
        });
        await this.verifyDetail(id, data);
        return this.database.repairDetail.save(this.database.repairDetail.create({ ...data, repairRequestId: id }));
    }

    async addDetails(id: number, data: CreateRepairDetailsDto) {
        await this.isStatusValid({
            id,
            statuses: [REPAIR_REQUEST_STATUS.DRAFT, REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.REJECTED],
        });
        await this.verifyDetails(id, data.details);
        return this.database.repairDetail.save(data.details.map((item) => ({ ...item, repairRequestId: id })));
    }

    async updateDetail(id: number, detailId: number, data: UpdateRepairDetailDto) {
        await this.isStatusValid({
            id,
            statuses: [REPAIR_REQUEST_STATUS.DRAFT, REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.REJECTED],
        });
        await this.verifyDetail(id, data, detailId);
        return this.database.repairDetail.update({ id: detailId, repairRequestId: id }, data);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [REPAIR_REQUEST_STATUS.DRAFT, REPAIR_REQUEST_STATUS.PENDING, REPAIR_REQUEST_STATUS.REJECTED],
        });
        return this.database.repairDetail.delete({ id: detailId, repairRequestId: id });
    }

    /**
     * The function checks if a given repair request status is valid.
     * @param {number} id - The `id` parameter is the unique identifier of a repair request. It is used
     * to find the repair request in the database.
     * @param {string[]} statuses - An array of valid statuses for a repair request.
     * @returns the repairRequest object.
     */
    private async isStatusValid(data: { id: number; statuses: string[] }) {
        const repairRequest = await this.database.repairRequest.findOneBy({ id: data.id });
        if (!repairRequest) throw new HttpException('Không tìm thấy phiếu sửa chữa', 404);
        if (!data.statuses.includes(repairRequest.status)) throw new HttpException('Trạng thái không hợp lệ', 400);
        return repairRequest;
    }

    private async verifyDetails(
        requestId: number,
        details: { brokenPart?: string; description?: string; replacementPartId: number; quantity: number }[],
    ) {
        const replacementParts = await this.database.product.findBy({ id: In(details.map((item) => item.replacementPartId)) });
        if (replacementParts.length !== details.length) throw new HttpException('Linh kiện không tồn tại', 400);
        if (details.some((item) => item.quantity < 1)) throw new HttpException('Số lượng không hợp lệ', 400);

        const isDuplicate = await this.database.repairDetail.findOneBy({
            repairRequestId: requestId,
            replacementPartId: In(details.map((item) => item.replacementPartId)),
        });
        if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào danh sách', 400);

        // CONSIDER: check if replacementPart in stock
    }

    private async verifyDetail(
        id: number,
        detail: { brokenPart?: string; description?: string; replacementPartId?: number; quantity?: number },
        detailId?: number,
    ) {
        const isDuplicate = await this.database.repairDetail.findOneBy({
            repairRequestId: id,
            replacementPartId: detail.replacementPartId,
            id: detailId ? Not(detailId) : undefined,
        });
        if (isDuplicate) throw new HttpException('Sản phẩm đã được thêm vào danh sách', 400);
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new RepairRequestEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async processApproval(data: {
        id: number;
        mustHaveStatuses: string[];
        toStatus: string;
        event: string;
        comment: string;
        approverId: number;
        action: APPROVAL_ACTION;
        currentUserId: number;
    }) {
        const request = await this.isStatusValid({ id: data.id, statuses: data.mustHaveStatuses });

        if (data.currentUserId && data.approverId && data.currentUserId === data.approverId)
            throw new HttpException('Bạn không thể chuyển yêu cầu cho chính mình', 400);
        if (data.action !== APPROVAL_ACTION.SUBMIT && request.currentApproverId !== data.currentUserId)
            throw new HttpException('Bạn không có quyền thực hiện hành động này', 400);
        if (data.action === APPROVAL_ACTION.SUBMIT && request.createdById !== data.currentUserId)
            throw new HttpException('Bạn không có quyền thực hiện hành động này', 400);

        const nextApprover = [APPROVAL_ACTION.APPROVE, APPROVAL_ACTION.REJECT].includes(data.action) ? null : data.approverId;
        this.database.repairRequest.update(data.id, { status: data.toStatus, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('repairRequest', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entityId: data.id,
                entity: 'repairRequest',
                approverId: UserStorage.getId(),
                action: data.action,
                comment: data.comment,
                status: data.toStatus,
                step: step,
                submittedAt: new Date(),
            }),
        );

        this.emitEvent(data.event, { id: data.id });

        return { message: 'Thao tác thành công', data: { id: data.id } };
    }
}
