import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreatePaymentRequestListDto } from './dto/create-payment-request-list.dto';
import { UpdatePaymentRequestListDto } from './dto/update-payment-request-list.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { APPROVAL_ACTION, PAYMENT_REQUEST_LIST_STATUS, POSITION } from '~/common/enums/enum';
import { PaymentRequestListEvent } from './events/payment-request-list.event';
import { UserStorage } from '~/common/storages/user.storage';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentRequestListEntity } from '~/database/typeorm/entities/paymentRequestList.entity';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreatePaymentRequestDetailDto, CreatePaymentRequestDetailsDto } from './dto/create-payment-request-detail.dto';
import { UpdatePaymentRequestDetailDto } from './dto/update-payment-request-detail.dto';

@Injectable()
export class PaymentRequestListService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new PaymentRequestListEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: {
        id: number;
        statuses: any[];
        userId?: number;
        currentApproverId?: number;
    }): Promise<PaymentRequestListEntity> {
        const entity = await this.database.paymentRequestList.findOneBy({ id: data.id });
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
        from: PAYMENT_REQUEST_LIST_STATUS[];
        to: PAYMENT_REQUEST_LIST_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển bảng kê đề nghị thanh toán cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.paymentRequestList.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('paymentRequestList', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'paymentRequestList',
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

    async create(createPaymentRequestListDto: CreatePaymentRequestListDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? PAYMENT_REQUEST_LIST_STATUS.APPROVED : PAYMENT_REQUEST_LIST_STATUS.DRAFT;
        const { attachmentIds, ...rest } = createPaymentRequestListDto;

        const paymentRequestList = await this.database.paymentRequestList.save(
            this.database.paymentRequestList.create({
                ...rest,
                createdById: UserStorage.getId(),
                status,
            }),
        );

        if (!this.utilService.isEmpty(attachmentIds)) this.database.paymentRequestList.addAttachments(paymentRequestList.id, attachmentIds);

        this.emitEvent('paymentRequestList.created', { id: paymentRequestList.id });
        return paymentRequestList;
    }

    async findAll(queries: FilterDto & { status: PAYMENT_REQUEST_LIST_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.paymentRequestList,
            queries,
            builderAdditional: async (builder) => {
                // builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('paymentRequestList');
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
        const builder = this.database.paymentRequestList.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.attachments', 'attachments');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'paymentRequestList',
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

    async update(id: number, updatePaymentRequestListDto: UpdatePaymentRequestListDto) {
        await this.isStatusValid({
            id,
            statuses: [PAYMENT_REQUEST_LIST_STATUS.DRAFT, PAYMENT_REQUEST_LIST_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        const { attachmentIds, ...rest } = updatePaymentRequestListDto;

        if (!this.utilService.isEmpty(attachmentIds)) {
            await this.database.paymentRequestList.removeAllAttachments(id);
            await this.database.paymentRequestList.addAttachments(id, attachmentIds);
        }

        return this.database.paymentRequestList.update(id, {
            ...rest,
            updatedById: UserStorage.getId(),
            status: PAYMENT_REQUEST_LIST_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [PAYMENT_REQUEST_LIST_STATUS.DRAFT, PAYMENT_REQUEST_LIST_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.paymentRequestDetail.delete({ paymentRequestListId: id });
        return this.database.paymentRequestList.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [PAYMENT_REQUEST_LIST_STATUS.IN_PROGRESS],
            to: PAYMENT_REQUEST_LIST_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('paymentRequestList.approved', { id });

        return { message: 'Đã duyệt bảng kê đề nghị thanh toán', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [PAYMENT_REQUEST_LIST_STATUS.IN_PROGRESS],
            to: PAYMENT_REQUEST_LIST_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('paymentRequestList.rejected', { id });

        return { message: 'Đã từ chối bảng kê đề nghị thanh toán', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [PAYMENT_REQUEST_LIST_STATUS.DRAFT, PAYMENT_REQUEST_LIST_STATUS.IN_PROGRESS],
            to: PAYMENT_REQUEST_LIST_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('paymentRequestList.forwarded', { id });

        return { message: 'Đã chuyển bảng kê đề nghị thanh toán', data: { id } };
    }

    async getDetails(queries: FilterDto & { paymentRequestListId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.paymentRequestDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['staff.fullName'], keyword: queries.search }));

        builder.andWhere('entity.paymentRequestListId = :id', { id: queries.paymentRequestListId });
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

    async addDetails(id: number, dto: CreatePaymentRequestDetailsDto) {
        const paymentRequest = await this.isStatusValid({
            id,
            statuses: [PAYMENT_REQUEST_LIST_STATUS.DRAFT, PAYMENT_REQUEST_LIST_STATUS.REJECTED],
        });

        return this.database.paymentRequestDetail.save(dto.details.map((detail) => ({ ...detail, paymentRequestListId: id })));
    }

    async addDetail(id: number, detail: CreatePaymentRequestDetailDto) {
        return this.database.paymentRequestDetail.save(this.database.paymentRequestDetail.create({ ...detail, paymentRequestListId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdatePaymentRequestDetailDto) {
        return this.database.paymentRequestDetail.update({ id: detailId, paymentRequestListId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [PAYMENT_REQUEST_LIST_STATUS.DRAFT, PAYMENT_REQUEST_LIST_STATUS.REJECTED],
        });
        await this.database.paymentRequestDetail.delete({ id: detailId, paymentRequestListId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
