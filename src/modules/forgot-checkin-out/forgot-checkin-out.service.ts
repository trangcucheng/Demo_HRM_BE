import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateForgotCheckinOutDto } from './dto/create-forgot-checkin-out.dto';
import { UpdateForgotCheckinOutDto } from './dto/update-forgot-checkin-out.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ForgotCheckinOutEvent } from './events/forgot_checkin_out.event';
import { UserStorage } from '~/common/storages/user.storage';
import { ForgotCheckinOutEntity } from '~/database/typeorm/entities/forgotCheckinOut.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APPROVAL_ACTION, FORGOT_CHECKIN_OUT_STATUS } from '~/common/enums/enum';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';

@Injectable()
export class ForgotCheckinOutService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new ForgotCheckinOutEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<ForgotCheckinOutEntity> {
        const entity = await this.database.forgotCheckinOut.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy đơn quên checkin/out', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa đơn quên checkin/out do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa đơn quên checkin/out này', 403);
        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt yêu cầu này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: FORGOT_CHECKIN_OUT_STATUS[];
        to: FORGOT_CHECKIN_OUT_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển đơn quên checkin/out cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.forgotCheckinOut.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('forgotCheckinOut', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'forgotCheckinOut',
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

    async create(createForgotCheckinOutDto: CreateForgotCheckinOutDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? FORGOT_CHECKIN_OUT_STATUS.APPROVED : FORGOT_CHECKIN_OUT_STATUS.DRAFT;
        const forgotCheckinOut = await this.database.forgotCheckinOut.save(
            this.database.forgotCheckinOut.create({
                ...createForgotCheckinOutDto,
                status,
                createdById: UserStorage.getId(),
            }),
        );

        this.emitEvent('forgotCheckinOut.created', { id: forgotCheckinOut.id });
        return forgotCheckinOut;
    }

    async findAll(queries: FilterDto & { status: FORGOT_CHECKIN_OUT_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.forgotCheckinOut,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('forgotCheckinOut');
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
        const builder = this.database.forgotCheckinOut.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('createdBy.position', 'cbPosition');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'forgotCheckinOut',
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

    async update(id: number, updateForgotCheckinOutDto: UpdateForgotCheckinOutDto) {
        await this.isStatusValid({
            id,
            statuses: [FORGOT_CHECKIN_OUT_STATUS.DRAFT, FORGOT_CHECKIN_OUT_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.forgotCheckinOut.update(id, {
            ...updateForgotCheckinOutDto,
            updatedById: UserStorage.getId(),
            status: FORGOT_CHECKIN_OUT_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [FORGOT_CHECKIN_OUT_STATUS.DRAFT, FORGOT_CHECKIN_OUT_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        return this.database.forgotCheckinOut.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [FORGOT_CHECKIN_OUT_STATUS.IN_PROGRESS],
            to: FORGOT_CHECKIN_OUT_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('forgotCheckinOut.approved', { id });

        return { message: 'Đã duyệt đơn quên checkin/out', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [FORGOT_CHECKIN_OUT_STATUS.IN_PROGRESS],
            to: FORGOT_CHECKIN_OUT_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('forgotCheckinOut.rejected', { id });

        return { message: 'Đã từ chối đơn quên checkin/out', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [FORGOT_CHECKIN_OUT_STATUS.DRAFT, FORGOT_CHECKIN_OUT_STATUS.IN_PROGRESS],
            to: FORGOT_CHECKIN_OUT_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('forgotCheckinOut.forwarded', { id });

        return { message: 'Đã chuyển đơn quên checkin/out', data: { id } };
    }
}
