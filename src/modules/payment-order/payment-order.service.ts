import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { UpdatePaymentOrderDto } from './dto/update-payment-order.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { APPROVAL_ACTION, PAYMENT_ORDER_STATUS, POSITION } from '~/common/enums/enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserStorage } from '~/common/storages/user.storage';
import { PaymentOrderEvent } from './events/payment-order.event';
import { PaymentOrderEntity } from '~/database/typeorm/entities/paymentOrder.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';

@Injectable()
export class PaymentOrderService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new PaymentOrderEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<PaymentOrderEntity> {
        const entity = await this.database.paymentOrder.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy đơn đề nghị thanh toán', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa đơn đề nghị thanh toán do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId)
            throw new HttpException('Bạn không có quyền chỉnh sửa đơn đề nghị thanh toán này', 403);
        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt yêu cầu này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: PAYMENT_ORDER_STATUS[];
        to: PAYMENT_ORDER_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển đơn đề nghị thanh toán cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.paymentOrder.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('paymentOrder', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'paymentOrder',
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

    async create(createPaymentOrderDto: CreatePaymentOrderDto) {
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? PAYMENT_ORDER_STATUS.APPROVED : PAYMENT_ORDER_STATUS.DRAFT;
        const { attachmentIds, ...rest } = createPaymentOrderDto;

        const paymentOrder = await this.database.paymentOrder.save(
            this.database.paymentOrder.create({
                ...rest,
                status,
                createdById: UserStorage.getId(),
            }),
        );

        if (!this.utilService.isEmpty(attachmentIds)) this.database.paymentOrder.addAttachments(paymentOrder.id, attachmentIds);

        this.emitEvent('paymentOrder.created', { id: paymentOrder.id });
        return paymentOrder;
    }

    async findAll(queries: FilterDto & { status: PAYMENT_ORDER_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.paymentOrder,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['content'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('paymentOrder');
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
        const builder = this.database.paymentOrder.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndSelect('entity.attachments', 'attachments');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'paymentOrder',
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

    async update(id: number, updatePaymentOrderDto: UpdatePaymentOrderDto) {
        await this.isStatusValid({
            id,
            statuses: [PAYMENT_ORDER_STATUS.DRAFT, PAYMENT_ORDER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        const { attachmentIds, ...rest } = updatePaymentOrderDto;

        if (!this.utilService.isEmpty(attachmentIds)) {
            await this.database.paymentOrder.removeAllAttachments(id);
            await this.database.paymentOrder.addAttachments(id, attachmentIds);
        }

        return this.database.paymentOrder.update(id, {
            ...rest,
            updatedById: UserStorage.getId(),
            status: PAYMENT_ORDER_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [PAYMENT_ORDER_STATUS.DRAFT, PAYMENT_ORDER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        return this.database.paymentOrder.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [PAYMENT_ORDER_STATUS.IN_PROGRESS],
            to: PAYMENT_ORDER_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('paymentOrder.approved', { id });

        return { message: 'Đã duyệt đơn đề nghị thanh toán', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [PAYMENT_ORDER_STATUS.IN_PROGRESS],
            to: PAYMENT_ORDER_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('paymentOrder.rejected', { id });

        return { message: 'Đã từ chối đơn đề nghị thanh toán', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [PAYMENT_ORDER_STATUS.DRAFT, PAYMENT_ORDER_STATUS.IN_PROGRESS],
            to: PAYMENT_ORDER_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('paymentOrder.forwarded', { id });

        return { message: 'Đã chuyển đơn đề nghị thanh toán', data: { id } };
    }
}
