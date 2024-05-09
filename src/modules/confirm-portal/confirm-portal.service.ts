import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateConfirmPortalDto } from './dto/create-confirm-portal.dto';
import { UpdateConfirmPortalDto } from './dto/update-confirm-portal.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ConfirmPortalEvent } from './events/confirm-portal.event';
import { UserStorage } from '~/common/storages/user.storage';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APPROVAL_ACTION, CONFIRM_PORTAL_STATUS, POSITION } from '~/common/enums/enum';
import { ConfirmPortalEntity } from '~/database/typeorm/entities/confirmPortal.entity';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateConfirmPortalDetailDto, CreateConfirmPortalDetailsDto } from './dto/create-confirm-portal-detail.dto';
import { In, Not } from 'typeorm';
import { UpdateConfirmPortalDetailDto } from './dto/update-confirm-portal-detail.dto';

@Injectable()
export class ConfirmPortalService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new ConfirmPortalEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<ConfirmPortalEntity> {
        const entity = await this.database.confirmPortal.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy giấy xác nhận qua cổng bảo vệ', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa giấy xác nhận qua cổng bảo vệ do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId)
            throw new HttpException('Bạn không có quyền chỉnh sửa giấy xác nhận qua cổng bảo vệ này', 403);

        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId)
                throw new HttpException('Bạn không có quyền duyệt giấy xác nhận qua cổng bảo vệ này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: CONFIRM_PORTAL_STATUS[];
        to: CONFIRM_PORTAL_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển giấy xác nhận qua cổng bảo vệ cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.confirmPortal.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('confirmPortal', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'confirmPortal',
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

    private async verifyDetail(confirmPortalId: number, detail: { staffId?: number; quantity?: number; note?: string }, detailId?: number) {
        if (detail?.staffId) {
            const isDuplicate = await this.database.confirmPortalDetail.findOneBy({
                confirmPortalId,
                staffId: detail.staffId,
                id: detailId ? Not(detailId) : undefined,
            });
            if (isDuplicate) throw new HttpException('Nhân viên đã được thêm vào giấy xác nhận qua cổng bảo vệ', 400);
        }
    }

    private async verifyDetails(confirmPortalId: number, details: { staffId: number }[]) {
        const staffIds = details.map((detail) => detail.staffId).filter((staffId) => staffId);
        if (staffIds.length === 0) throw new HttpException('Người nhận không được để trống', 400);

        const staffs = await this.database.user.find({ select: ['id'], where: { id: In(staffIds) } });
        const staffIdsInDb = staffs.map((staff) => staff.id);
        const staffIdsNotInDb = staffIds.filter((staffId) => !staffIdsInDb.includes(staffId));
        if (staffIdsNotInDb.length > 0) throw new HttpException(`Nhân viên ${staffIdsNotInDb.join(',')} không tồn tại`, 400);
    }

    async create(createConfirmPortalDto: CreateConfirmPortalDto) {
        const { ...rest } = createConfirmPortalDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? CONFIRM_PORTAL_STATUS.APPROVED : CONFIRM_PORTAL_STATUS.DRAFT;

        const confirmPortal = await this.database.confirmPortal.save(
            this.database.confirmPortal.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('confirmPortal.created', { id: confirmPortal.id });
        return confirmPortal;
    }

    async findAll(queries: FilterDto & { status: CONFIRM_PORTAL_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.confirmPortal,
            queries,
            builderAdditional: async (builder) => {
                // builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('confirmPortal');
                console.log(conditions);

                builder.andWhere(conditions.creatorCondition);
                if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);

                if (queries.month && queries.year) {
                    builder.andWhere('MONTH(entity.createdAt) = :month AND YEAR(entity.createdAt) = :year', {
                        month: queries.month,
                        year: queries.year,
                    });
                }

                builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
                builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
                builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
                builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
                builder.leftJoinAndSelect('entity.currentApprover', 'currentApprover');
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
                    'currentApprover.id',
                    'currentApprover.fullName',
                ]);
            },
        });
    }

    findOne(id: number) {
        const builder = this.database.confirmPortal.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'confirmPortal',
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

    async update(id: number, updateConfirmPortalDto: UpdateConfirmPortalDto) {
        await this.isStatusValid({
            id,
            statuses: [CONFIRM_PORTAL_STATUS.DRAFT, CONFIRM_PORTAL_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.confirmPortal.update(id, {
            ...updateConfirmPortalDto,
            updatedById: UserStorage.getId(),
            status: CONFIRM_PORTAL_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [CONFIRM_PORTAL_STATUS.DRAFT, CONFIRM_PORTAL_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.confirmPortalDetail.delete({ confirmPortalId: id });
        return this.database.confirmPortal.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [CONFIRM_PORTAL_STATUS.IN_PROGRESS],
            to: CONFIRM_PORTAL_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('confirmPortal.approved', { id });

        return { message: 'Đã duyệt giấy xác nhận qua cổng bảo vệ', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [CONFIRM_PORTAL_STATUS.IN_PROGRESS],
            to: CONFIRM_PORTAL_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('confirmPortal.rejected', { id });

        return { message: 'Đã từ chối giấy xác nhận qua cổng bảo vệ', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [CONFIRM_PORTAL_STATUS.DRAFT, CONFIRM_PORTAL_STATUS.IN_PROGRESS],
            to: CONFIRM_PORTAL_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('confirmPortal.forwarded', { id });

        return { message: 'Đã chuyển giấy xác nhận qua cổng bảo vệ', data: { id } };
    }

    async getDetails(queries: FilterDto & { confirmPortalId: number; staffId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.confirmPortalDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['staff.fullName'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.staff', 'staff');
        builder.andWhere('entity.confirmPortalId = :id', { id: queries.confirmPortalId });
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

    async addDetails(id: number, dto: CreateConfirmPortalDetailsDto) {
        const confirmPortal = await this.isStatusValid({
            id,
            statuses: [CONFIRM_PORTAL_STATUS.DRAFT, CONFIRM_PORTAL_STATUS.REJECTED],
        });

        await this.verifyDetails(id, dto.details);
        return this.database.confirmPortalDetail.save(dto.details.map((detail) => ({ ...detail, confirmPortalId: id })));
    }

    async addDetail(id: number, detail: CreateConfirmPortalDetailDto) {
        const confirmPortal = await this.isStatusValid({
            id,
            statuses: [CONFIRM_PORTAL_STATUS.DRAFT, CONFIRM_PORTAL_STATUS.REJECTED],
        });

        await this.verifyDetail(id, detail);
        return this.database.confirmPortalDetail.save(this.database.confirmPortalDetail.create({ ...detail, confirmPortalId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateConfirmPortalDetailDto) {
        await this.verifyDetail(id, detail, detailId);
        return this.database.confirmPortalDetail.update({ id: detailId, confirmPortalId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [CONFIRM_PORTAL_STATUS.DRAFT, CONFIRM_PORTAL_STATUS.REJECTED],
        });
        await this.database.confirmPortalDetail.delete({ id: detailId, confirmPortalId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
