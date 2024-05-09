import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class ShiftService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createShiftDto: CreateShiftDto) {
        return this.database.shift.save(this.database.shift.create(createShiftDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.shift, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['type'], keyword: queries.type }));

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
        const builder = this.database.shift.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateShiftDto: UpdateShiftDto) {
        return this.database.shift.update(id, updateShiftDto);
    }

    remove(id: number) {
        return this.database.shift.delete(id);
    }
}
