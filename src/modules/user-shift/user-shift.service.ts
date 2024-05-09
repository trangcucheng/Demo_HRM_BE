import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateUserShiftDto } from './dto/create-user-shift.dto';
import { UpdateUserShiftDto } from './dto/update-user-shift.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class UserShiftService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createUserShiftDto: CreateUserShiftDto) {
        return this.database.userShift.save(this.database.userShift.create(createUserShiftDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.userShift, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.shift', 'shift');
        builder.leftJoinAndSelect('entity.user', 'user');

        builder.select(['entity', 'shift', 'user']);

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
        return this.database.userShift.findOneUserShiftWithAllRelationsById(id);
    }

    update(id: number, updateUserShiftDto: UpdateUserShiftDto) {
        return this.database.userShift.update(id, updateUserShiftDto);
    }

    remove(id: number) {
        return this.database.userShift.delete(id);
    }

    getUsers(id: number) {
        return this.database.userShift.findAllUserByShiftId(id);
    }
}
