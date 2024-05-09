import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateFoodVoucherDto } from './dto/create-food-voucher.dto';
import { UpdateFoodVoucherDto } from './dto/update-food-voucher.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { FoodVoucherEvent } from './events/food-voucher.event';
import { UserStorage } from '~/common/storages/user.storage';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FoodVoucherEntity } from '~/database/typeorm/entities/foodVoucher.entity';
import { APPROVAL_ACTION, FOOD_VOUCHER_STATUS } from '~/common/enums/enum';
import { In, Not } from 'typeorm';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateFoodVoucherDetailDto, CreateFoodVoucherDetailsDto } from './dto/create-food-voucher-detail.dto';
import { UpdateFoodVoucherDetailDto } from './dto/update-food-voucher-detail.dto';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Injectable()
export class FoodVoucherService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new FoodVoucherEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<FoodVoucherEntity> {
        const entity = await this.database.foodVoucher.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu cấp chế độ ăn ca', 404);
        if (!data.statuses.includes(entity.status))
            throw new HttpException('Không thể chỉnh sửa phiếu cấp chế độ ăn ca do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId)
            throw new HttpException('Bạn không có quyền chỉnh sửa phiếu cấp chế độ ăn ca này', 403);

        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId)
                throw new HttpException('Bạn không có quyền duyệt phiếu cấp chế độ ăn ca này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: FOOD_VOUCHER_STATUS[];
        to: FOOD_VOUCHER_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển phiếu cấp chế độ ăn ca cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.foodVoucher.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('foodVoucher', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'foodVoucher',
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

    private async verifyDetail(foodVoucherId: number, detail: { staffId?: number }, detailId?: number) {
        if (detail?.staffId) {
            const isDuplicate = await this.database.foodVoucherDetail.findOneBy({
                foodVoucherId,
                staffId: detail.staffId,
                id: detailId ? Not(detailId) : undefined,
            });
            if (isDuplicate) throw new HttpException('Nhân viên đã được thêm vào phiếu cấp chế độ ăn ca', 400);
        }
    }

    private async verifyDetails(riceCouponId: number, details: { staffId: number }[]) {
        const staffIds = details.map((detail) => detail.staffId).filter((staffId) => staffId);
        if (staffIds.length === 0) throw new HttpException('Người nhận không được để trống', 400);

        const staffs = await this.database.user.find({ select: ['id'], where: { id: In(staffIds) } });
        const staffIdsInDb = staffs.map((staff) => staff.id);
        const staffIdsNotInDb = staffIds.filter((staffId) => !staffIdsInDb.includes(staffId));
        if (staffIdsNotInDb.length > 0) throw new HttpException(`Nhân viên ${staffIdsNotInDb.join(',')} không tồn tại`, 400);

        if (riceCouponId) {
            const isDuplicate = await this.database.riceCouponDetail.findOneBy({ riceCouponId, staffId: In(staffIds) });
            if (isDuplicate) throw new HttpException('Nhân viên đã được thêm vào phiếu cấp chế độ ăn ca', 400);
        }
    }

    async create(createFoodVoucherDto: CreateFoodVoucherDto) {
        const { ...rest } = createFoodVoucherDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? FOOD_VOUCHER_STATUS.APPROVED : FOOD_VOUCHER_STATUS.DRAFT;
        const foodVoucher = await this.database.foodVoucher.save(
            this.database.foodVoucher.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('foodVoucher.created', { id: foodVoucher.id });
        return foodVoucher;
    }

    async findAll(queries: FilterDto & { status: FOOD_VOUCHER_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.foodVoucher,
            queries,
            builderAdditional: async (builder) => {
                // builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('foodVoucher');
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
        const builder = this.database.foodVoucher.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.department', 'department');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'foodVoucher',
        });
        builder.leftJoinAndMapOne('ah.approver', UserEntity, 'approver', 'approver.id = ah.approverId');
        builder.leftJoinAndSelect('entity.currentApprover', 'currentApprover');

        builder.where('entity.id = :id', { id });
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

    async update(id: number, updateFoodVoucherDto: UpdateFoodVoucherDto) {
        await this.isStatusValid({
            id,
            statuses: [FOOD_VOUCHER_STATUS.DRAFT, FOOD_VOUCHER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.foodVoucher.update(id, {
            ...updateFoodVoucherDto,
            updatedById: UserStorage.getId(),
            status: FOOD_VOUCHER_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [FOOD_VOUCHER_STATUS.DRAFT, FOOD_VOUCHER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.foodVoucherDetail.delete({ foodVoucherId: id });
        return this.database.foodVoucher.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [FOOD_VOUCHER_STATUS.IN_PROGRESS],
            to: FOOD_VOUCHER_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('foodVoucher.approved', { id });

        return { message: 'Đã duyệt phiếu cấp chế độ ăn ca', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [FOOD_VOUCHER_STATUS.IN_PROGRESS],
            to: FOOD_VOUCHER_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('foodVoucher.rejected', { id });

        return { message: 'Đã từ chối phiếu cấp chế độ ăn ca', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [FOOD_VOUCHER_STATUS.DRAFT, FOOD_VOUCHER_STATUS.IN_PROGRESS],
            to: FOOD_VOUCHER_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('foodVoucher.forwarded', { id });

        return { message: 'Đã chuyển phiếu cấp chế độ ăn ca', data: { id } };
    }

    async getDetails(queries: FilterDto & { foodVoucherId: number; staffId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.foodVoucherDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['staff.fullName'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.staff', 'staff');
        builder.andWhere('entity.foodVoucherId = :id', { id: queries.foodVoucherId });
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

    async addDetails(id: number, dto: CreateFoodVoucherDetailsDto) {
        const foodVoucher = await this.isStatusValid({
            id,
            statuses: [FOOD_VOUCHER_STATUS.DRAFT, FOOD_VOUCHER_STATUS.REJECTED],
        });

        await this.verifyDetails(id, dto.details);
        return this.database.foodVoucherDetail.save(dto.details.map((detail) => ({ ...detail, foodVoucherId: id })));
    }

    async addDetail(id: number, detail: CreateFoodVoucherDetailDto) {
        const foodVoucher = await this.isStatusValid({
            id,
            statuses: [FOOD_VOUCHER_STATUS.DRAFT, FOOD_VOUCHER_STATUS.REJECTED],
        });

        await this.verifyDetail(id, detail);
        return this.database.foodVoucherDetail.save(this.database.foodVoucherDetail.create({ ...detail, foodVoucherId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateFoodVoucherDetailDto) {
        await this.verifyDetail(id, detail, detailId);
        return this.database.foodVoucherDetail.update({ id: detailId, foodVoucherId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [FOOD_VOUCHER_STATUS.DRAFT, FOOD_VOUCHER_STATUS.REJECTED],
        });
        await this.database.foodVoucherDetail.delete({ id: detailId, foodVoucherId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
