import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createUnitDto: CreateUnitDto) {
        return this.database.unit.save(this.database.unit.create(createUnitDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.unit, queries);

        if (!this.utilService.isEmpty(queries.search))
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
        return this.database.unit.findOne({ where: { id } });
    }

    update(id: number, updateUnitDto: UpdateUnitDto) {
        return this.database.unit.update(id, updateUnitDto);
    }

    remove(id: number) {
        this.database.product.update({ unitId: id }, { unitId: null });
        return this.database.unit.delete(id);
    }
}
