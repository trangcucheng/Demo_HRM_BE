import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreatePositionGroupDto } from './dto/create-position-group.dto';
import { UpdatePositionGroupDto } from './dto/update-position-group.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class PositionGroupService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createPositionGroupDto: CreatePositionGroupDto) {
        return this.database.positionGroup.save(this.database.positionGroup.create(createPositionGroupDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.positionGroup, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

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

    findOne(id: number) {
        const builder = this.database.positionGroup.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updatePositionGroupDto: UpdatePositionGroupDto) {
        return this.database.positionGroup.update(id, updatePositionGroupDto);
    }

    remove(id: number) {
        return this.database.positionGroup.delete(id);
    }
}
