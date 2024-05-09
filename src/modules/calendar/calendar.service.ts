import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CALENDAR_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';

@Injectable()
export class CalendarService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createCalendarDto: CreateCalendarDto) {
        const { userIds, ...rest } = createCalendarDto;

        const calendar = await this.database.calendar.save(this.database.calendar.create({ ...rest, createdBy: UserStorage.getId() }));

        await this.database.calendar.addCalendarUser(calendar.id, userIds);

        return calendar;
    }

    async findAllByUserLogin(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.calendar, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['content'], keyword: queries.search }));
        builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'calendarUser', userId: UserStorage.getId() }));

        builder.leftJoinAndSelect('entity.calendarUsers', 'calendarUser');
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

    async findAll(queries: FilterDto & { calendarType: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.calendar, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['title'], keyword: queries.search }));

        if (queries.calendarType === CALENDAR_TYPE.BY_DAY) {
            builder.andWhere('DAY(entity.startDate) = DAY(CURRENT_DATE()) OR DAY(entity.endDate) = DAY(CURRENT_DATE())');
        } else if (queries.calendarType === CALENDAR_TYPE.BY_WEEK) {
            builder.andWhere(
                'entity.startDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) OR entity.endDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)',
            );
        } else if (queries.calendarType === CALENDAR_TYPE.BY_MONTH) {
            builder.andWhere('MONTH(entity.startDate) = MONTH(CURRENT_DATE()) OR MONTH(entity.endDate) = MONTH(CURRENT_DATE())');
        }

        builder.leftJoinAndSelect('entity.users', 'users');
        builder.select(['entity', 'users.id', 'users.fullName']);

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
        const builder = this.database.calendar.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.users', 'user');
        builder.where({ id });
        builder.select(['entity', 'user.id', 'user.fullName']);
        return builder.getOne();
    }

    async update(id: number, updateCalendarDto: UpdateCalendarDto) {
        const { userIds, ...rest } = updateCalendarDto;

        await this.database.calendar.removeCalendarUser(id);
        await this.database.calendar.addCalendarUser(id, userIds);

        return await this.database.calendar.update(id, { ...rest, updatedBy: UserStorage.getId() });
    }

    async remove(id: number) {
        await this.database.calendar.removeCalendarUser(id);

        return await this.database.calendar.delete(id);
    }
}
