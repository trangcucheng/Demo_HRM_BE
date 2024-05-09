import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateRequestOvertimeDto } from './dto/create-request-overtime.dto';
import { UpdateRequestOvertimeDto } from './dto/update-request-overtime.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { APPROVAL_ACTION, REQUEST_OVERTIME_STATUS } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { RequestOvertimeEvent } from './events/request-overtime.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestOvertimeEntity } from '~/database/typeorm/entities/requestOvertime.entity';
import { In, Not } from 'typeorm';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateRequestOvertimeDetailDto, CreateRequestOvertimeDetailsDto } from './dto/create-request-overtime-detail.dto';
import { UpdateRequestOvertimeDetailDto } from './dto/update-request-overtime-detail.dto';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Injectable()
export class RequestOvertimeService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new RequestOvertimeEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<RequestOvertimeEntity> {
        const entity = await this.database.requestOvertime.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy bảng kê đề nghị thanh toán', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa bảng kê đề nghị thanh toán do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId)
            throw new HttpException('Bạn không có quyền chỉnh sửa bảng kê đề nghị thanh toán này', 403);

        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId)
                throw new HttpException('Bạn không có quyền duyệt bảng kê đề nghị thanh toán này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: REQUEST_OVERTIME_STATUS[];
        to: REQUEST_OVERTIME_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển giấy đề nghị tăng ca cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.requestOvertime.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('requestOvertime', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'requestOvertime',
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

    private async verifyDetail(requestOvertimeId: number, detail: { staffId?: number }, detailId?: number) {
        if (detail?.staffId) {
            const isDuplicate = await this.database.requestOvertimeDetail.findOneBy({
                requestOvertimeId,
                staffId: detail.staffId,
                id: detailId ? Not(detailId) : undefined,
            });
            if (isDuplicate) throw new HttpException('Nhân viên đã được thêm vào giấy đề nghị tăng ca', 400);
        }
    }

    private async verifyDetails(requestOvertimeId: number, details: { staffId: number }[]) {
        const staffIds = details.map((detail) => detail.staffId).filter((staffId) => staffId);
        if (staffIds.length === 0) throw new HttpException('Người nhận không được để trống', 400);

        const staffs = await this.database.user.find({ select: ['id'], where: { id: In(staffIds) } });
        const staffIdsInDb = staffs.map((staff) => staff.id);
        const staffIdsNotInDb = staffIds.filter((staffId) => !staffIdsInDb.includes(staffId));
        if (staffIdsNotInDb.length > 0) throw new HttpException(`Nhân viên ${staffIdsNotInDb.join(',')} không tồn tại`, 400);
    }

    async create(createRequestOvertimeDto: CreateRequestOvertimeDto) {
        const { ...rest } = createRequestOvertimeDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? REQUEST_OVERTIME_STATUS.APPROVED : REQUEST_OVERTIME_STATUS.DRAFT;

        const requestOvertime = await this.database.requestOvertime.save(
            this.database.requestOvertime.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('requestOvertime.created', { id: requestOvertime.id });
        return requestOvertime;
    }

    async findAll(queries: FilterDto & { status: REQUEST_OVERTIME_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.requestOvertime,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('requestOvertime');
                console.log(conditions);

                builder.andWhere(conditions.creatorCondition);
                if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);

                if (queries.month && queries.year) {
                    builder.andWhere('MONTH(entity.createdAt) = :month AND YEAR(entity.createdAt) = :year', {
                        month: queries.month,
                        year: queries.year,
                    });
                }

                builder.leftJoinAndSelect('entity.department', 'department');
                builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
                builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
                builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
                builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
                builder.leftJoinAndSelect('entity.currentApprover', 'currentApprover');
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
                    'currentApprover.id',
                    'currentApprover.fullName',
                ]);
            },
        });
    }

    findOne(id: number) {
        const builder = this.database.requestOvertime.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'requestAdvancePayment',
        });
        builder.leftJoinAndMapOne('ah.approver', UserEntity, 'approver', 'approver.id = ah.approverId');
        builder.leftJoinAndSelect('entity.currentApprover', 'currentApprover');

        builder.where('entity.id = :id', { id });
        builder.select([
            'entity',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'updatedBy.id',
            'updatedBy.fullName',
            'ubDepartment.id',
            'ubDepartment.name',
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

    async update(id: number, updateRequestOvertimeDto: UpdateRequestOvertimeDto) {
        await this.isStatusValid({
            id,
            statuses: [REQUEST_OVERTIME_STATUS.DRAFT, REQUEST_OVERTIME_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.requestOvertime.update(id, {
            ...updateRequestOvertimeDto,
            updatedById: UserStorage.getId(),
            status: REQUEST_OVERTIME_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [REQUEST_OVERTIME_STATUS.DRAFT, REQUEST_OVERTIME_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.requestOvertimeDetail.delete({ requestOvertimeId: id });
        return this.database.requestOvertime.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [REQUEST_OVERTIME_STATUS.IN_PROGRESS],
            to: REQUEST_OVERTIME_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('requestOvertime.approved', { id });

        return { message: 'Đã duyệt giấy đề nghị tăng ca', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [REQUEST_OVERTIME_STATUS.IN_PROGRESS],
            to: REQUEST_OVERTIME_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('requestOvertime.rejected', { id });

        return { message: 'Đã từ chối giấy đề nghị tăng ca', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [REQUEST_OVERTIME_STATUS.DRAFT, REQUEST_OVERTIME_STATUS.IN_PROGRESS],
            to: REQUEST_OVERTIME_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('requestOvertime.forwarded', { id });

        return { message: 'Đã chuyển giấy đề nghị tăng ca', data: { id } };
    }

    async getDetails(queries: FilterDto & { requestOvertimeId: number; staffId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.requestOvertimeDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['staff.fullName'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.staff', 'staff');
        builder.andWhere('entity.requestOvertimeId = :id', { id: queries.requestOvertimeId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['staffId']));
        builder.select(['entity', 'staff.id', 'staff.fullName']);

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

    async addDetails(id: number, dto: CreateRequestOvertimeDetailsDto) {
        const requestOvertime = await this.isStatusValid({
            id,
            statuses: [REQUEST_OVERTIME_STATUS.DRAFT, REQUEST_OVERTIME_STATUS.REJECTED],
        });

        await this.verifyDetails(id, dto.details);
        return this.database.requestOvertimeDetail.save(dto.details.map((detail) => ({ ...detail, requestOvertimeId: id })));
    }

    async addDetail(id: number, detail: CreateRequestOvertimeDetailDto) {
        const requestOvertime = await this.isStatusValid({
            id,
            statuses: [REQUEST_OVERTIME_STATUS.DRAFT, REQUEST_OVERTIME_STATUS.REJECTED],
        });

        // await this.verifyDetail(id, detail);
        return this.database.requestOvertimeDetail.save(this.database.requestOvertimeDetail.create({ ...detail, requestOvertimeId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateRequestOvertimeDetailDto) {
        // await this.verifyDetail(id, detail, detailId);
        return this.database.requestOvertimeDetail.update({ id: detailId, requestOvertimeId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [REQUEST_OVERTIME_STATUS.DRAFT, REQUEST_OVERTIME_STATUS.REJECTED],
        });
        await this.database.requestOvertimeDetail.delete({ id: detailId, requestOvertimeId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
