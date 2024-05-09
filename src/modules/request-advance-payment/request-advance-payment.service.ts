import { APPROVAL_ACTION, POSITION, REQUEST_ADVANCE_PAYMENT_STATUS } from './../../common/enums/enum';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateRequestAdvancePaymentDto } from './dto/create-request-advance-payment.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UpdateRequestAdvancePaymentDto } from './dto/update-request-advance-payment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestAdvancePaymentEvent } from './events/request-advance-payment.event';
import { UserStorage } from '~/common/storages/user.storage';
import { RequestAdvancePaymentEntity } from '~/database/typeorm/entities/requestAdvancePayment.entity';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateRequestAdvancePaymentDetailDto, CreateRequestAdvancePaymentDetailsDto } from './dto/create-request-advance-payment-detail.dto';
import { UpdateRequestAdvancePaymentDetailDto } from './dto/update-request-advance-payment-detail.dto';

@Injectable()
export class RequestAdvancePaymentService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    // used for human resources
    async accessControl(): Promise<{ accessControlCondition: string; creatorCondition: string }> {
        const userId = UserStorage.getId();
        const departmentId = UserStorage.getDepartmentId();
        const positionId = UserStorage.getPositionId();
        const positionCode = UserStorage.getPositionCode();
        const accessControlList = await this.database.documentAccessControl.getAccessControlList('requestAdvancePayment', positionId);
        let accessControl = null;
        console.log(accessControlList);

        // determines BOD if AC have null department id
        accessControlList.forEach((ac) => {
            if (!ac.departmentId) {
                accessControl = ac;
                return;
            }

            if (ac.departmentId === departmentId) {
                accessControl = ac;
                return;
            }

            return;
        });

        let userIds = [];
        const accessControlCondition = null; // list for department/position
        // list for creator and current approver, also previous approver
        let creatorCondition = `(
            entity.createdById = ${userId} 
            OR entity.currentApproverId = ${userId}
            OR entity.id IN (
                SELECT ah.entity_id 
                FROM approval_history ah 
                WHERE ah.approver_id = ${userId} 
                    AND ah.entity = 'requestAdvancePayment'
            )
        )`;

        console.log(userId, departmentId, positionId, accessControl);

        if (positionCode === 'thu_quy') {
            creatorCondition = `(
                entity.createdById = ${userId} 
                OR entity.currentApproverId = ${userId}
                OR entity.id IN (
                    SELECT ah.entity_id 
                    FROM approval_history ah 
                    WHERE ah.approver_id = ${userId} 
                        AND ah.entity = 'requestAdvancePayment'
                )
                OR (
                    entity.status = 'APPROVED'
                        AND entity.currentApproverId IN (
                        SELECT u.id 
                        FROM users u 
                        JOIN positions p
                        ON u.position_id = p.id
                            WHERE p.code = 'GĐ'
                    )
                )
            )`;

            return {
                accessControlCondition,
                creatorCondition,
            };
        }

        if (accessControl) {
            switch (true) {
                case accessControl.canViewAllDepartments:
                    userIds = await this.database.user.getAllUserIds();
                    break;
                case accessControl.canViewSpecificDepartment:
                    userIds = await this.database.user.getUsersInDepartments(accessControl.departmentIds);
                    break;
                case accessControl.canViewOwnDepartment:
                    userIds = await this.database.user.getUsersInDepartmentsv2(departmentId);
                    break;
                default:
                    break;
            }

            if (userIds.length > 0)
                creatorCondition = `(
                    entity.createdById = ${userId} 
                    OR entity.currentApproverId = ${userId}
                    OR entity.id IN (
                        SELECT ah.entity_id 
                        FROM approval_history ah 
                        WHERE ah.approver_id = ${userId} 
                            AND ah.entity = 'requestAdvancePayment'
                    )
                    OR ((entity.status != 'DRAFT' OR entity.status != 'REJECTED') 
                        AND entity.createdById IN (${userIds.join(',')}))
                )`;
        }

        return {
            accessControlCondition,
            creatorCondition,
        };
    }

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new RequestAdvancePaymentEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: {
        id: number;
        statuses: any[];
        userId?: number;
        currentApproverId?: number;
    }): Promise<RequestAdvancePaymentEntity> {
        const entity = await this.database.requestAdvancePayment.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy đơn đề nghị tạm ứng', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa đơn đề nghị tạm ứng do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa đơn đề nghị tạm ứng này', 403);

        if (UserStorage.getPositionCode() === 'thu_quy' && entity.currentApproverId) {
            const builder = this.database.user.createQueryBuilder('entity');
            builder.leftJoinAndSelect('entity.position', 'position');
            builder.where('entity.id = :id', { id: entity.currentApproverId });
            builder.select(['entity', 'position']);
            const currentApprover = await builder.getOne();

            if (currentApprover.position.code !== 'GĐ') throw new HttpException('Bạn không có quyền duyệt đơn đề nghị tạm ứng này', 403);
        } else if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt đơn đề nghị tạm ứng này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: REQUEST_ADVANCE_PAYMENT_STATUS[];
        to: REQUEST_ADVANCE_PAYMENT_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển đơn đề nghị tạm ứng cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.requestAdvancePayment.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('requestAdvancePayment', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'requestAdvancePayment',
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

    async create(createRequestAdvancePaymentDto: CreateRequestAdvancePaymentDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? REQUEST_ADVANCE_PAYMENT_STATUS.APPROVED : REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT;
        const { attachmentIds, ...rest } = createRequestAdvancePaymentDto;

        const requestAdvancePayment = await this.database.requestAdvancePayment.save(
            this.database.requestAdvancePayment.create({
                ...rest,
                createdById: UserStorage.getId(),
                status,
            }),
        );

        if (!this.utilService.isEmpty(attachmentIds)) this.database.requestAdvancePayment.addAttachments(requestAdvancePayment.id, attachmentIds);

        this.emitEvent('requestAdvancePayment.created', { id: requestAdvancePayment.id });
        return requestAdvancePayment;
    }

    async findAll(queries: FilterDto & { status: REQUEST_ADVANCE_PAYMENT_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.requestAdvancePayment,
            queries,
            builderAdditional: async (builder) => {
                // builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.accessControl();
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
        const builder = this.database.requestAdvancePayment.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.attachments', 'attachments');
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
            'attachments.id',
            'attachments.name',
            'attachments.path',
        ]);

        return builder.getOne();
    }

    async update(id: number, updateRequestAdvancePaymentDto: UpdateRequestAdvancePaymentDto) {
        await this.isStatusValid({
            id,
            statuses: [REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT, REQUEST_ADVANCE_PAYMENT_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        const { attachmentIds, ...rest } = updateRequestAdvancePaymentDto;

        if (!this.utilService.isEmpty(attachmentIds)) {
            await this.database.paymentOrder.removeAllAttachments(id);
            await this.database.paymentOrder.addAttachments(id, attachmentIds);
        }

        return this.database.requestAdvancePayment.update(id, {
            ...rest,
            updatedById: UserStorage.getId(),
            status: REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT, REQUEST_ADVANCE_PAYMENT_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.requestAdvancePaymentDetail.delete({ requestAdvancePaymentId: id });
        return this.database.requestAdvancePayment.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [REQUEST_ADVANCE_PAYMENT_STATUS.IN_PROGRESS],
            to: REQUEST_ADVANCE_PAYMENT_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('requestAdvancePayment.approved', { id });

        return { message: 'Đã duyệt đơn đề nghị tạm ứng', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [REQUEST_ADVANCE_PAYMENT_STATUS.IN_PROGRESS],
            to: REQUEST_ADVANCE_PAYMENT_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('requestAdvancePayment.rejected', { id });

        return { message: 'Đã từ chối đơn đề nghị tạm ứng', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT, REQUEST_ADVANCE_PAYMENT_STATUS.IN_PROGRESS],
            to: REQUEST_ADVANCE_PAYMENT_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('requestAdvancePayment.forwarded', { id });

        return { message: 'Đã chuyển đơn đề nghị tạm ứng', data: { id } };
    }

    async getDetails(queries: FilterDto & { requestAdvancePaymentId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.requestAdvancePaymentDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['staff.fullName'], keyword: queries.search }));

        builder.andWhere('entity.requestAdvancePaymentId = :id', { id: queries.requestAdvancePaymentId });
        builder.select(['entity']);

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

    async addDetails(id: number, dto: CreateRequestAdvancePaymentDetailsDto) {
        const requestAdvancePayment = await this.isStatusValid({
            id,
            statuses: [REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT, REQUEST_ADVANCE_PAYMENT_STATUS.REJECTED],
        });

        return this.database.requestAdvancePaymentDetail.save(dto.details.map((detail) => ({ ...detail, requestAdvancePaymentId: id })));
    }

    async addDetail(id: number, detail: CreateRequestAdvancePaymentDetailDto) {
        return this.database.requestAdvancePaymentDetail.save(
            this.database.requestAdvancePaymentDetail.create({ ...detail, requestAdvancePaymentId: id }),
        );
    }

    async updateDetail(id: number, detailId: number, detail: UpdateRequestAdvancePaymentDetailDto) {
        return this.database.requestAdvancePaymentDetail.update({ id: detailId, requestAdvancePaymentId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [REQUEST_ADVANCE_PAYMENT_STATUS.DRAFT, REQUEST_ADVANCE_PAYMENT_STATUS.REJECTED],
        });
        await this.database.requestAdvancePaymentDetail.delete({ id: detailId, requestAdvancePaymentId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
