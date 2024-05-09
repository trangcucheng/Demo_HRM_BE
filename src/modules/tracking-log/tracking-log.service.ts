import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateTrackingLogDto } from './dto/create-tracking-log.dto';
import { UpdateTrackingLogDto } from './dto/update-tracking-log.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { TrackingLogEvent } from './events/tracking-log.event';
import { UserStorage } from '~/common/storages/user.storage';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrackingLogEntity } from '~/database/typeorm/entities/trackingLog.entity';
import { APPROVAL_ACTION, TRACKING_LOG_STATUS } from '~/common/enums/enum';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateTrackingLogDetailDto, CreateTrackingLogDetailsDto } from './dto/create-tracking-log-detail.dto';
import { UpdateTrackingLogDetailDto } from './dto/update-tracking-log-detail.dto';

@Injectable()
export class TrackingLogService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new TrackingLogEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<TrackingLogEntity> {
        const entity = await this.database.trackingLog.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy nhật ký theo dõi ra vào', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa nhật ký theo dõi ra vào do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId)
            throw new HttpException('Bạn không có quyền chỉnh sửa nhật ký theo dõi ra vào này', 403);
        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt yêu cầu này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: TRACKING_LOG_STATUS[];
        to: TRACKING_LOG_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        await this.database.trackingLog.update(data.id, { status: data.to, currentApproverId: UserStorage.getId() });
        const step = await this.database.approvalHistory.getNextStep('trackingLog', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'trackingLog',
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

    async create(createTrackingLogDto: CreateTrackingLogDto) {
        const { ...rest } = createTrackingLogDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? TRACKING_LOG_STATUS.APPROVED : TRACKING_LOG_STATUS.DRAFT;

        const trackingLog = await this.database.trackingLog.save(
            this.database.trackingLog.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('trackingLog.created', { id: trackingLog.id });
        return trackingLog;
    }

    async findAll(queries: FilterDto & { status: TRACKING_LOG_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.trackingLog,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['createdBy.fullName'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('trackingLog');
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
        const builder = this.database.trackingLog.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'trackingLog',
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
            'staff.id',
            'staff.fullName',
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

    async update(id: number, updateTrackingLogDto: UpdateTrackingLogDto) {
        await this.isStatusValid({
            id,
            statuses: [TRACKING_LOG_STATUS.DRAFT, TRACKING_LOG_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.trackingLog.update(id, {
            ...updateTrackingLogDto,
            updatedById: UserStorage.getId(),
            status: TRACKING_LOG_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [TRACKING_LOG_STATUS.DRAFT, TRACKING_LOG_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.trackingLogDetail.delete({ trackingLogId: id });
        return this.database.trackingLog.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [TRACKING_LOG_STATUS.DRAFT],
            to: TRACKING_LOG_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('trackingLog.approved', { id });

        return { message: 'Đã duyệt nhật ký theo dõi ra vào', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [TRACKING_LOG_STATUS.IN_PROGRESS],
            to: TRACKING_LOG_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('trackingLog.rejected', { id });

        return { message: 'Đã từ chối nhật ký theo dõi ra vào', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [TRACKING_LOG_STATUS.DRAFT, TRACKING_LOG_STATUS.IN_PROGRESS],
            to: TRACKING_LOG_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('trackingLog.forwarded', { id });

        return { message: 'Đã chuyển nhật ký theo dõi ra vào', data: { id } };
    }

    async addDetails(id: number, dto: CreateTrackingLogDetailsDto) {
        const trackingLog = await this.isStatusValid({
            id,
            statuses: [TRACKING_LOG_STATUS.DRAFT, TRACKING_LOG_STATUS.REJECTED],
        });

        return this.database.trackingLogDetail.save(dto.details.map((detail) => ({ ...detail, trackingLogId: id })));
    }

    async getDetails(queries: FilterDto & { trackingLogId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.trackingLogDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['content'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.staff', 'staff');
        builder.leftJoinAndSelect('staff.department', 'department');

        builder.andWhere('entity.trackingLogId = :id', { id: queries.trackingLogId });
        builder.select(['entity', 'staff.id', 'staff.fullName', 'department.id', 'department.name']);

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

    async addDetail(id: number, detail: CreateTrackingLogDetailDto) {
        return this.database.trackingLogDetail.save(this.database.trackingLogDetail.create({ ...detail, trackingLogId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateTrackingLogDetailDto) {
        return this.database.trackingLogDetail.update({ id: detailId, trackingLogId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [TRACKING_LOG_STATUS.DRAFT, TRACKING_LOG_STATUS.REJECTED],
        });
        await this.database.trackingLogDetail.delete({ id: detailId, trackingLogId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
