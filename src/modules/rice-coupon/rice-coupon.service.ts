import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateRiceCouponDto } from './dto/create-rice-coupon.dto';
import { UpdateRiceCouponDto } from './dto/update-rice-coupon.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { RiceCouponEvent } from './events/rice-coupon.event';
import { UserStorage } from '~/common/storages/user.storage';
import { RiceCouponEntity } from '~/database/typeorm/entities/riceCoupon.entity';
import { APPROVAL_ACTION, RICE_COUPON_STATUS } from '~/common/enums/enum';
import { In, Not } from 'typeorm';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateRiceCounponDetailDto, CreateRiceCouponDetailsDto } from './dto/create-rice-coupon-detail.dto';
import { UpdateRiceCouponDetailDto } from './dto/update-rice-coupon-detail.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Injectable()
export class RiceCouponService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new RiceCouponEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<RiceCouponEntity> {
        const entity = await this.database.riceCoupon.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy phiếu báo cơm', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa phiếu báo cơm do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa phiếu báo cơm này', 403);

        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt phiếu báo cơm này', 403);
        }

        return entity;
    }

    private async verifyDetails(riceCouponId: number, details: { staffId: number }[]) {
        const staffIds = details.map((detail) => detail.staffId).filter((staffId) => staffId);
        if (staffIds.length === 0) throw new HttpException('Dòng theo dõi không được để trống', 400);

        const staffs = await this.database.user.find({ select: ['id'], where: { id: In(staffIds) } });
        const staffIdsInDb = staffs.map((staff) => staff.id);
        const staffIdsNotInDb = staffIds.filter((staffId) => !staffIdsInDb.includes(staffId));
        if (staffIdsNotInDb.length > 0) throw new HttpException(`Nhân viên ${staffIdsNotInDb.join(',')} không tồn tại`, 400);

        if (riceCouponId) {
            const isDuplicate = await this.database.riceCouponDetail.findOneBy({ riceCouponId, staffId: In(staffIds) });
            if (isDuplicate) throw new HttpException('Nhân viên đã được thêm vào phiếu báo cơm', 400);
        }
    }

    private async updateStatus(data: {
        id: number;
        from: RICE_COUPON_STATUS[];
        to: RICE_COUPON_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển phiếu báo cơm cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.riceCoupon.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('riceCoupon', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'riceCoupon',
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

    private async verifyDetail(riceCouponId: number, detail: { staffId?: number }, detailId?: number) {
        if (detail?.staffId) {
            const isDuplicate = await this.database.riceCouponDetail.findOneBy({
                riceCouponId,
                staffId: detail.staffId,
                id: detailId ? Not(detailId) : undefined,
            });
            if (isDuplicate) throw new HttpException('Nhân viên đã được thêm vào phiếu báo cơm', 400);
        }
    }

    async create(createRiceCouponDto: CreateRiceCouponDto) {
        const { ...rest } = createRiceCouponDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? RICE_COUPON_STATUS.APPROVED : RICE_COUPON_STATUS.DRAFT;
        const riceCoupon = await this.database.riceCoupon.save(
            this.database.riceCoupon.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('riceCoupon.created', { id: riceCoupon.id });
        return riceCoupon;
    }

    async findAll(queries: FilterDto & { status: RICE_COUPON_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.riceCoupon,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['department.name'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('riceCoupon');
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
        const builder = this.database.riceCoupon.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.department', 'department');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'riceCoupon',
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

    async update(id: number, updateRiceCouponDto: UpdateRiceCouponDto) {
        await this.isStatusValid({
            id,
            statuses: [RICE_COUPON_STATUS.DRAFT, RICE_COUPON_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.riceCoupon.update(id, {
            ...updateRiceCouponDto,
            updatedById: UserStorage.getId(),
            status: RICE_COUPON_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [RICE_COUPON_STATUS.DRAFT, RICE_COUPON_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.riceCouponDetail.delete({ riceCouponId: id });
        return this.database.riceCoupon.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [RICE_COUPON_STATUS.IN_PROGRESS],
            to: RICE_COUPON_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('riceCoupon.approved', { id });

        return { message: 'Đã duyệt phiếu báo cơm', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [RICE_COUPON_STATUS.IN_PROGRESS],
            to: RICE_COUPON_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('riceCoupon.rejected', { id });

        return { message: 'Đã từ chối phiếu báo cơm', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [RICE_COUPON_STATUS.DRAFT, RICE_COUPON_STATUS.IN_PROGRESS],
            to: RICE_COUPON_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('riceCoupon.forwarded', { id });

        return { message: 'Đã chuyển phiếu báo cơm', data: { id } };
    }

    async getDetails(queries: FilterDto & { riceCouponId: number; staffId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.riceCouponDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['staff.fullName'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.staff', 'staff');
        builder.leftJoinAndSelect('staff.department', 'department');
        builder.andWhere('entity.riceCouponId = :id', { id: queries.riceCouponId });
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['staffId']));
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

    async addDetails(id: number, dto: CreateRiceCouponDetailsDto) {
        const riceCoupon = await this.isStatusValid({
            id,
            statuses: [RICE_COUPON_STATUS.DRAFT, RICE_COUPON_STATUS.REJECTED],
        });

        await this.verifyDetails(id, dto.details);
        return this.database.riceCouponDetail.save(dto.details.map((detail) => ({ ...detail, riceCouponId: id })));
    }

    async addDetail(id: number, detail: CreateRiceCounponDetailDto) {
        const riceCoupon = await this.isStatusValid({
            id,
            statuses: [RICE_COUPON_STATUS.DRAFT, RICE_COUPON_STATUS.REJECTED],
        });

        await this.verifyDetail(id, detail);
        return this.database.riceCouponDetail.save(this.database.riceCouponDetail.create({ ...detail, riceCouponId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateRiceCouponDetailDto) {
        await this.verifyDetail(id, detail, detailId);
        return this.database.riceCouponDetail.update({ id: detailId, riceCouponId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [RICE_COUPON_STATUS.DRAFT, RICE_COUPON_STATUS.REJECTED],
        });
        await this.database.riceCouponDetail.delete({ id: detailId, riceCouponId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
