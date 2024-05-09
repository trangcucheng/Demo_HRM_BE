import { HttpException, Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CacheService, UtilService } from '~/shared/services';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import * as xls from 'excel4node';
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import stream from 'stream';
import { PositionRepository } from '~/database/typeorm/repositories/position.repository';

@Injectable()
export class PositionService {
    constructor(
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
        private readonly cacheService: CacheService,
        private readonly positionRepository: PositionRepository,
    ) {}

    async create(createPositionDto: CreatePositionDto) {
        const { roleIds, ...positionData } = createPositionDto;
        const position = await this.database.position.save(this.database.position.create(positionData));
        this.database.position.addRoles(position.id, roleIds);
        return position;
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.position, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));
        builder.andWhere('entity.id != 1');

        builder.leftJoinAndSelect('entity.contracts', 'contracts');
        builder.leftJoinAndSelect('entity.positionGroup', 'positionGroup');
        builder.leftJoinAndSelect('entity.roles', 'roles');

        builder.select(['entity', 'contracts', 'positionGroup', 'roles.id', 'roles.name']);

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

    findOne(id: number) {
        return this.database.position.findOnePositiontWithAllRelationsById(id);
    }

    async update(id: number, updatePositionDto: UpdatePositionDto) {
        const { roleIds, ...positionData } = updatePositionDto;
        if (roleIds?.length > 0) {
            await this.database.position.removeRoles(id);
            await this.database.position.addRoles(id, roleIds);
        }

        this.database.loadPermissionsByPositionToCache();

        return this.database.position.update(id, positionData);
    }

    remove(id: number) {
        return this.database.position.delete(id);
    }

    async export(queries: FilterDto) {
        const builder = this.positionRepository.createQueryBuilder('entity');
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.contracts', 'contracts');
        builder.leftJoinAndSelect('entity.positionGroup', 'positionGroup');
        builder.leftJoinAndSelect('entity.roles', 'roles');

        builder.select(['entity', 'contracts', 'positionGroup', 'roles']);

        const [result, total] = await builder.getManyAndCount();

        if (result.length === 0) {
            throw new HttpException('No data', 417);
        }

        const excelBuffer = await this.exportExcel(`Position data`, result);

        return excelBuffer;
    }

    private async exportExcel(title, datas) {
        const wb = new xls.Workbook();
        const ws = wb.addWorksheet('Sheet 1');

        ws.cell(1, 1, 1, 12, true)
            .string(title)
            .style({
                font: { size: 20 },
                alignment: { horizontal: 'center' },
            });
        ws.cell(2, 1).string('ID');
        ws.cell(2, 2).string('Tên chức vụ');
        ws.cell(2, 3).string('Mã');
        ws.cell(2, 4).string('Trạng thái');
        ws.cell(2, 5).string('Mô tả');
        ws.cell(2, 6).string('Level');
        ws.cell(2, 7).string('Tên nhóm chức vụ');
        ws.cell(2, 8).string('Trạng thái quản lý');
        ws.cell(2, 9).string('Mô tả nhóm chức vụ');
        ws.cell(2, 10).string('Tên vai trò');
        ws.cell(2, 11).string('Mô tả vai trò');
        ws.cell(2, 12).string('Thời gian tạo');
        ws.column(12).setWidth(30);

        for (let i = 0; i < datas.length; i++) {
            const item = datas[i];
            ws.cell(i + 3, 1).string(`${item.id}`);
            ws.cell(i + 3, 2).string(`${item.name}`);
            ws.cell(i + 3, 3).string(`${item.code}`);
            ws.cell(i + 3, 4).string(`${item.isActive}`);
            ws.cell(i + 3, 5).string(`${item.description}`);
            ws.cell(i + 3, 6).string(`${item.level}`);
            ws.cell(i + 3, 7).string(`${item.positionGroup ? item.positionGroup.name : ''}`);
            ws.cell(i + 3, 8).string(`${item.positionGroup ? item.positionGroup.isManager : ''}}`);
            ws.cell(i + 3, 9).string(`${item.positionGroup ? item.positionGroup.description : ''}`);
            ws.cell(i + 3, 10).string(`${item.roles[0] ? item.roles[0].name : ''}`);
            ws.cell(i + 3, 11).string(`${item.roles[0] ? item.roles[0].description : ''}`);
            ws.cell(i + 3, 12).string(moment(item.created_at).format('DD-MM-YYYY HH:mm:ss'));
        }

        const buffer = await wb.writeToBuffer();

        return buffer;
    }
}
