import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { APPROVAL_ACTION, LEAVE_APPLICATION_STATUS } from '~/common/enums/enum';
import { LeaveApplicationEntity } from '~/database/typeorm/entities/leaveApplication.entity';
import { UserStorage } from '~/common/storages/user.storage';
import { LeaveApplicationEvent } from './events/leave-application.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';

@Injectable()
export class LeaveApplicationService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new LeaveApplicationEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<LeaveApplicationEntity> {
        const entity = await this.database.leaveApplication.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy đơn nghỉ phép', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa đơn nghỉ phép do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa đơn nghỉ phép này', 403);
        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt đơn nghỉ phép này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: LEAVE_APPLICATION_STATUS[];
        to: LEAVE_APPLICATION_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển đơn nghỉ phép cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.leaveApplication.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('leaveApplication', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'leaveApplication',
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

    async create(createLeaveApplicationDto: CreateLeaveApplicationDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? LEAVE_APPLICATION_STATUS.APPROVED : LEAVE_APPLICATION_STATUS.DRAFT;
        const leaveApplication = await this.database.leaveApplication.save(
            this.database.leaveApplication.create({
                ...createLeaveApplicationDto,
                status,
                createdById: UserStorage.getId(),
            }),
        );

        this.emitEvent('leaveApplication.created', { id: leaveApplication.id });
        return leaveApplication;
    }

    async findAll(queries: FilterDto & { status: LEAVE_APPLICATION_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.leaveApplication,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('leaveApplication');
                console.log(conditions);

                builder.andWhere(conditions.creatorCondition);
                if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);

                if (queries.month && queries.year) {
                    builder.andWhere('MONTH(entity.startDay) = :month AND YEAR(entity.startDay) = :year', {
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
        const builder = this.database.leaveApplication.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('createdBy.position', 'cbPosition');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'leaveApplication',
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
            'cbPosition.id',
            'cbPosition.name',
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

    async update(id: number, updateLeaveApplicationDto: UpdateLeaveApplicationDto) {
        await this.isStatusValid({
            id,
            statuses: [LEAVE_APPLICATION_STATUS.DRAFT, LEAVE_APPLICATION_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.leaveApplication.update(id, {
            ...updateLeaveApplicationDto,
            updatedById: UserStorage.getId(),
            status: LEAVE_APPLICATION_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [LEAVE_APPLICATION_STATUS.DRAFT, LEAVE_APPLICATION_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        return this.database.leaveApplication.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [LEAVE_APPLICATION_STATUS.IN_PROGRESS],
            to: LEAVE_APPLICATION_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('leaveApplication.approved', { id });

        return { message: 'Đã duyệt đơn nghỉ phép', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [LEAVE_APPLICATION_STATUS.IN_PROGRESS],
            to: LEAVE_APPLICATION_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('leaveApplication.rejected', { id });

        return { message: 'Đã từ chối đơn nghỉ phép', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [LEAVE_APPLICATION_STATUS.DRAFT, LEAVE_APPLICATION_STATUS.IN_PROGRESS],
            to: LEAVE_APPLICATION_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('leaveApplication.forwarded', { id });

        return { message: 'Đã chuyển đơn nghỉ phép', data: { id } };
    }
}
