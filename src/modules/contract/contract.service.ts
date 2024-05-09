import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class ContractService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createContractDto: CreateContractDto) {
        return this.database.contract.save(this.database.contract.create(createContractDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.contract, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.position', 'position');
        builder.leftJoinAndSelect('entity.user', 'user');

        builder.select(['entity', 'position', 'user']);

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
        return this.database.contract.findOneContractWithAllRelationsById(id);
    }

    update(id: number, updateContractDto: UpdateContractDto) {
        return this.database.contract.update(id, updateContractDto);
    }

    remove(id: number) {
        return this.database.contract.delete(id);
    }
}
