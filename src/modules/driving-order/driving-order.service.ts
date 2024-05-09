import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateDrivingOrderDto } from './dto/create-driving-order.dto';
import { UpdateDrivingOrderDto } from './dto/update-driving-order.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { APPROVAL_ACTION, DRIVING_ORDER_STATUS, POSITION } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DrivingOrderEvent } from './events/driving-order.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateDrivingOrderDetailDto, CreateDrivingOrderDetailsDto } from './dto/create-driving-order-detail.dto';
import { UpdateDrivingOrderDetailDto } from './dto/update-driving-order-detail.dto';
import { DrivingOrderEntity } from '~/database/typeorm/entities/drivingOrder.entity';

@Injectable()
export class DrivingOrderService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new DrivingOrderEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<DrivingOrderEntity> {
        const entity = await this.database.drivingOrder.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy giấy đi đường kiêm lệnh điều xe', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa giấy đi đường kiêm lệnh điều xe do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId)
            throw new HttpException('Bạn không có quyền chỉnh sửa giấy đi đường kiêm lệnh điều xe này', 403);

        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId)
                throw new HttpException('Bạn không có quyền duyệt giấy đi đường kiêm lệnh điều xe này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: DRIVING_ORDER_STATUS[];
        to: DRIVING_ORDER_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển giấy đi đường kiêm lệnh điều xe cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.drivingOrder.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('drivingOrder', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'drivingOrder',
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

    async create(createDrivingOrderDto: CreateDrivingOrderDto) {
        const { ...rest } = createDrivingOrderDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? DRIVING_ORDER_STATUS.APPROVED : DRIVING_ORDER_STATUS.DRAFT;

        const drivingOrder = await this.database.drivingOrder.save(
            this.database.drivingOrder.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('drivingOrder.created', { id: drivingOrder.id });
        return drivingOrder;
    }

    async findAll(queries: FilterDto & { status: DRIVING_ORDER_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.drivingOrder,
            queries,
            builderAdditional: async (builder) => {
                // builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('drivingOrder');
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
        const builder = this.database.drivingOrder.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'drivingOrder',
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

    async update(id: number, updateDrivingOrderDto: UpdateDrivingOrderDto) {
        await this.isStatusValid({
            id,
            statuses: [DRIVING_ORDER_STATUS.DRAFT, DRIVING_ORDER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.drivingOrder.update(id, {
            ...updateDrivingOrderDto,
            updatedById: UserStorage.getId(),
            status: DRIVING_ORDER_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [DRIVING_ORDER_STATUS.DRAFT, DRIVING_ORDER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.drivingOrderDetail.delete({ drivingOrderId: id });
        return this.database.drivingOrder.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [DRIVING_ORDER_STATUS.IN_PROGRESS],
            to: DRIVING_ORDER_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('drivingOrder.approved', { id });

        return { message: 'Đã duyệt giấy đi đường kiêm lệnh điều xe', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [DRIVING_ORDER_STATUS.IN_PROGRESS],
            to: DRIVING_ORDER_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('drivingOrder.rejected', { id });

        return { message: 'Đã từ chối giấy đi đường kiêm lệnh điều xe', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [DRIVING_ORDER_STATUS.DRAFT, DRIVING_ORDER_STATUS.IN_PROGRESS],
            to: DRIVING_ORDER_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('drivingOrder.forwarded', { id });

        return { message: 'Đã chuyển giấy đi đường kiêm lệnh điều xe', data: { id } };
    }

    async getDetails(queries: FilterDto & { drivingOrderId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.drivingOrderDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['departure', 'destination', 'vehicle'], keyword: queries.search }));

        builder.andWhere('entity.drivingOrderId = :id', { id: queries.drivingOrderId });
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

    async addDetails(id: number, dto: CreateDrivingOrderDetailsDto) {
        const drivingOrder = await this.isStatusValid({
            id,
            statuses: [DRIVING_ORDER_STATUS.DRAFT, DRIVING_ORDER_STATUS.REJECTED],
        });

        return this.database.drivingOrderDetail.save(dto.details.map((detail) => ({ ...detail, drivingOrderId: id })));
    }

    async addDetail(id: number, detail: CreateDrivingOrderDetailDto) {
        return this.database.drivingOrderDetail.save(this.database.drivingOrderDetail.create({ ...detail, drivingOrderId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateDrivingOrderDetailDto) {
        return this.database.drivingOrderDetail.update({ id: detailId, drivingOrderId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [DRIVING_ORDER_STATUS.DRAFT, DRIVING_ORDER_STATUS.REJECTED],
        });
        await this.database.drivingOrderDetail.delete({ id: detailId, drivingOrderId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
