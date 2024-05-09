import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class AssetService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createAssetDto: CreateAssetDto) {
        return this.database.asset.save(this.database.asset.create(createAssetDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.asset, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.department', 'department');

        builder.select(['entity', 'department']);

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
        return this.database.asset.findOneAssetWithAllRelationsById(id);
    }

    update(id: number, updateAssetDto: UpdateAssetDto) {
        return this.database.asset.update(id, updateAssetDto);
    }

    remove(id: number) {
        return this.database.asset.delete(id);
    }
}
