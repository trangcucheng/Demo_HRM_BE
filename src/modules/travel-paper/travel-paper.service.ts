import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateTravelPaperDto } from './dto/create-travel-paper.dto';
import { UpdateTravelPaperDto } from './dto/update-travel-paper.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TravelPaperEvent } from './events/travel-paper.event';
import { UserStorage } from '~/common/storages/user.storage';
import { APPROVAL_ACTION, TRAVEL_PAPER_STATUS } from '~/common/enums/enum';
import { TravelPaperEntity } from '~/database/typeorm/entities/travelPaper.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { NextApproverDto } from '~/common/dtos/next-approver.dto';
import { CreateTravelPaperDetailDto, CreateTravelPaperDetailsDto } from './dto/create-travel-paper-detail.dto';
import { UpdateTravelPaperDetailDto } from './dto/update-travel-paper-detail.dto';

@Injectable()
export class TravelPaperService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService, private eventEmitter: EventEmitter2) {}

    private emitEvent(event: string, data: { id: number }) {
        const eventObj = new TravelPaperEvent();
        eventObj.id = data.id;
        eventObj.senderId = UserStorage.getId();
        this.eventEmitter.emit(event, eventObj);
    }

    private async isStatusValid(data: { id: number; statuses: any[]; userId?: number; currentApproverId?: number }): Promise<TravelPaperEntity> {
        const entity = await this.database.travelPaper.findOneBy({ id: data.id });
        if (!entity) throw new HttpException('Không tìm thấy giấy đi đường', 404);
        if (!data.statuses.includes(entity.status)) throw new HttpException('Không thể chỉnh sửa giấy đi đường do trạng thái không hợp lệ', 400);
        if (data.userId && entity.createdById !== data.userId) throw new HttpException('Bạn không có quyền chỉnh sửa giấy đi đường này', 403);
        if (entity.currentApproverId && data.currentApproverId) {
            if (entity.currentApproverId !== data.currentApproverId) throw new HttpException('Bạn không có quyền duyệt yêu cầu này', 403);
        }

        return entity;
    }

    private async updateStatus(data: {
        id: number;
        from: TRAVEL_PAPER_STATUS[];
        to: TRAVEL_PAPER_STATUS;
        comment?: string;
        userId?: number;
        nextApproverId?: number;
        currentApproverId?: number;
        action: APPROVAL_ACTION;
    }) {
        if (data.currentApproverId && data.nextApproverId && data.currentApproverId === data.nextApproverId)
            throw new HttpException('Bạn không thể chuyển giấy đi đường cho chính mình', 400);

        await this.isStatusValid({
            id: data.id,
            statuses: data.from,
            userId: data.userId,
            currentApproverId: data.currentApproverId,
        });

        const nextApprover =
            data.action === APPROVAL_ACTION.REJECT ? null : data.action === APPROVAL_ACTION.APPROVE ? data.currentApproverId : data.nextApproverId;
        await this.database.travelPaper.update(data.id, { status: data.to, currentApproverId: nextApprover });
        const step = await this.database.approvalHistory.getNextStep('travelPaper', data.id);
        await this.database.approvalHistory.save(
            this.database.approvalHistory.create({
                entity: 'travelPaper',
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

    async create(createTravelPaperDto: CreateTravelPaperDto) {
        const { ...rest } = createTravelPaperDto;
        const isHigestLevel = await this.database.user.isHighestPosition(UserStorage.getId());
        const status = isHigestLevel ? TRAVEL_PAPER_STATUS.APPROVED : TRAVEL_PAPER_STATUS.DRAFT;

        const travelPaper = await this.database.travelPaper.save(
            this.database.travelPaper.create({ ...rest, createdById: UserStorage.getId(), status }),
        );

        this.emitEvent('travelPaper.created', { id: travelPaper.id });
        return travelPaper;
    }

    async findAll(queries: FilterDto & { status: TRAVEL_PAPER_STATUS; departmentId: string; month: number; year: number }) {
        return this.utilService.getList({
            repository: this.database.travelPaper,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['reason', 'address'], keyword: queries.search }));
                builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'createdBy', departmentId: queries.departmentId }));

                const conditions = await this.utilService.accessControlv2('travelPaper');
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
        const builder = this.database.travelPaper.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.updatedBy', 'updatedBy');
        builder.leftJoinAndSelect('updatedBy.department', 'ubDepartment');
        builder.leftJoinAndMapMany('entity.approvalHistory', ApprovalHistoryEntity, 'ah', 'ah.entityId = entity.id AND ah.entity = :entity', {
            entity: 'travelPaper',
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

    async update(id: number, updateTravelPaperDto: UpdateTravelPaperDto) {
        await this.isStatusValid({
            id,
            statuses: [TRAVEL_PAPER_STATUS.DRAFT, TRAVEL_PAPER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });

        return this.database.travelPaper.update(id, {
            ...updateTravelPaperDto,
            updatedById: UserStorage.getId(),
            status: TRAVEL_PAPER_STATUS.DRAFT,
        });
    }

    async remove(id: number) {
        await this.isStatusValid({
            id,
            statuses: [TRAVEL_PAPER_STATUS.DRAFT, TRAVEL_PAPER_STATUS.REJECTED],
            userId: UserStorage.getId(),
        });
        await this.database.travelPaperDetail.delete({ travelPaperId: id });
        return this.database.travelPaper.delete(id);
    }

    async approve(id: number) {
        await this.updateStatus({
            id,
            from: [TRAVEL_PAPER_STATUS.IN_PROGRESS],
            to: TRAVEL_PAPER_STATUS.APPROVED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.APPROVE,
        });

        this.emitEvent('travelPaper.approved', { id });

        return { message: 'Đã duyệt giấy đi đường kiêm lệnh điều xe', data: { id } };
    }

    async reject(id: number, comment: string) {
        await this.updateStatus({
            id,
            from: [TRAVEL_PAPER_STATUS.IN_PROGRESS],
            to: TRAVEL_PAPER_STATUS.REJECTED,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.REJECT,
            comment,
        });

        this.emitEvent('travelPaper.rejected', { id });

        return { message: 'Đã từ chối giấy đi đường kiêm lệnh điều xe', data: { id } };
    }

    async forward(id: number, dto: NextApproverDto) {
        await this.updateStatus({
            id,
            from: [TRAVEL_PAPER_STATUS.DRAFT, TRAVEL_PAPER_STATUS.IN_PROGRESS],
            to: TRAVEL_PAPER_STATUS.IN_PROGRESS,
            nextApproverId: dto.approverId,
            currentApproverId: UserStorage.getId(),
            action: APPROVAL_ACTION.FORWARD,
            comment: dto.comment,
        });

        this.emitEvent('travelPaper.forwarded', { id });

        return { message: 'Đã chuyển giấy đi đường kiêm lệnh điều xe', data: { id } };
    }

    async getDetails(queries: FilterDto & { travelPaperId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.travelPaperDetail, queries);
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['departure', 'destination', 'vehicle'], keyword: queries.search }));

        builder.andWhere('entity.travelPaperId = :id', { id: queries.travelPaperId });
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

    async addDetails(id: number, dto: CreateTravelPaperDetailsDto) {
        const travelPaper = await this.isStatusValid({
            id,
            statuses: [TRAVEL_PAPER_STATUS.DRAFT, TRAVEL_PAPER_STATUS.REJECTED],
        });

        return this.database.travelPaperDetail.save(dto.details.map((detail) => ({ ...detail, travelPaperId: id })));
    }

    async addDetail(id: number, detail: CreateTravelPaperDetailDto) {
        return this.database.travelPaperDetail.save(this.database.travelPaperDetail.create({ ...detail, travelPaperId: id }));
    }

    async updateDetail(id: number, detailId: number, detail: UpdateTravelPaperDetailDto) {
        return this.database.travelPaperDetail.update({ id: detailId, travelPaperId: id }, detail);
    }

    async removeDetail(id: number, detailId: number) {
        await this.isStatusValid({
            id,
            statuses: [TRAVEL_PAPER_STATUS.DRAFT, TRAVEL_PAPER_STATUS.REJECTED],
        });
        await this.database.travelPaperDetail.delete({ id: detailId, travelPaperId: id });
        return { message: 'Đã xóa chi tiết', data: { id } };
    }
}
