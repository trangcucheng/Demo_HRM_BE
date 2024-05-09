import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { In } from 'typeorm';

@Injectable()
export class HolidayService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    // create(createHolidayDto: CreateHolidayDto) {
    //     return this.database.holiday.save(this.database.holiday.create(createHolidayDto));
    // }

    async create(createHolidayDto: CreateHolidayDto) {
        const { users, ...rest } = createHolidayDto;
        await this.utilService.checkRelationIdExist({ user: { id: In(users), errorMessage: 'Nhân viên không tồn tại' } });

        const entity = await this.database.holiday.save(this.database.holiday.create({ ...rest }));

        this.database.holiday.addUsers(entity.id, users);

        return entity;
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.holiday, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.fullTextSearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.users', 'users');
        builder.select(['entity', 'users']);

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
        const builder = this.database.holiday.createQueryBuilder('entity');
        builder.where({ id });
        builder.leftJoinAndSelect('entity.users', 'users');
        builder.select(['entity', 'users']);
        return builder.getOne();
    }

    async update(id: number, updateHolidayDto: UpdateHolidayDto) {
        const { users, ...rest } = updateHolidayDto;
        const entity = await this.database.holiday.findOne({ where: { id } });
        if (!entity) throw new HttpException('Ngày nghỉ không tồn tại', 400);
        if (!this.utilService.isEmpty(users)) {
            await this.utilService.checkRelationIdExist({ user: { id: In(users), errorMessage: 'Nhân viên không tồn tại' } });
            await this.database.holiday.removeAllUser(id);
            await this.database.holiday.addUsers(id, users);
        }
        return this.database.holiday.update(id, { ...rest });
    }

    async remove(id: number) {
        const entity = await this.database.holiday.findOne({ where: { id } });
        if (!entity) throw new HttpException('Ngày nghỉ không tồn tại', 400);
        this.database.holiday.removeAllUser(id);
        return this.database.holiday.delete(id);
    }
}
