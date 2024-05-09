import { HttpException, Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';
import { PositionGroupEntity } from '~/database/typeorm/entities/positionGroup.entity';
import { UtilService } from '~/shared/services';
import { CreateAccessControlDto } from './dto/create-access-control.dto';
import { UpdateAccessControlDto } from './dto/update-access-control.dto';

@Injectable()
export class AccessControlService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createAccessControlDto: CreateAccessControlDto) {
        const isExist = await this.database.documentAccessControl.findOne({
            where: {
                entity: createAccessControlDto.entity,
                departmentId: createAccessControlDto.departmentId,
                positionId: createAccessControlDto.positionId,
            },
        });

        if (isExist) {
            throw new HttpException('Đã tồn tại quyền truy cập cho chức vụ/nhóm chức vụ này', 400);
        }

        return this.database.documentAccessControl.save(this.database.documentAccessControl.create(createAccessControlDto));
    }

    async findAll(queries: FilterDto & { entity: string; departmentId: string; positionId: string; positionGroupId: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.documentAccessControl, queries);

        builder.leftJoinAndMapOne('entity.department', DepartmentEntity, 'department', 'entity.departmentId = department.id');
        builder.leftJoinAndMapOne('entity.position', PositionEntity, 'position', 'entity.positionId = position.id');
        builder.leftJoinAndMapOne('entity.positionGroup', PositionGroupEntity, 'positionGroup', 'entity.positionGroupId = positionGroup.id');
        builder.select(['entity', 'department.id', 'department.name', 'position.id', 'position.name', 'positionGroup.id', 'positionGroup.name']);

        builder.where({ entity: Not('user') });
        if (queries.entity) builder.where({ entity: queries.entity });
        if (queries.departmentId) builder.andWhere({ departmentId: queries.departmentId });
        if (queries.positionId) builder.andWhere({ positionId: queries.positionId });
        if (queries.positionGroupId) builder.andWhere({ positionGroupId: queries.positionGroupId });

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

    async findOne(id: number) {
        const builder = this.database.documentAccessControl.createQueryBuilder('entity');
        builder.leftJoinAndMapOne('entity.department', DepartmentEntity, 'department', 'entity.departmentId = department.id');
        builder.leftJoinAndMapOne('entity.position', PositionEntity, 'position', 'entity.positionId = position.id');
        builder.leftJoinAndMapOne('entity.positionGroup', PositionGroupEntity, 'positionGroup', 'entity.positionGroupId = positionGroup.id');
        builder.select(['entity', 'department.id', 'department.name', 'position.id', 'position.name', 'positionGroup.id', 'positionGroup.name']);
        builder.where({ id });
        const res = await builder.getOne();
        if (res.departmentIds?.length > 0) {
            const departments = await this.database.department.findBy({ id: In(res.departmentIds) });
            res['departments'] = departments;
        }
        return res;
    }

    async update(id: number, updateAccessControlDto: UpdateAccessControlDto) {
        if (updateAccessControlDto.canViewSpecificDepartment) {
            if (!updateAccessControlDto.departmentIds || updateAccessControlDto.departmentIds.length === 0) {
                throw new HttpException('Danh sách phòng ban không được để trống', 400);
            }
        }

        return this.database.documentAccessControl.update(id, updateAccessControlDto);
    }

    remove(id: number) {
        return this.database.documentAccessControl.delete(id);
    }
}
