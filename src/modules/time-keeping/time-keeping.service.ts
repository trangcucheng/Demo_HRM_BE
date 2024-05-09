import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateTimeKeepingDto } from './dto/create-time-keeping.dto';
import { UpdateTimeKeepingDto } from './dto/update-time-keeping.dto';
import { FilterDto } from '~/common/dtos/filter.dto';

@Injectable()
export class TimeKeepingService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createTimeKeepingDto: CreateTimeKeepingDto, files: Array<Express.Multer.File>, userId: number) {
        return this.database.timeAttendance.save(
            this.database.timeAttendance.create({
                ...createTimeKeepingDto,
                supportingDocuments: files.length !== 0 ? files.map((file) => file.filename).join(',') : null,
                createdBy: userId,
            }),
        );
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.timeAttendance, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
        // builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

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
        const builder = this.database.timeAttendance.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateTimeKeepingDto: UpdateTimeKeepingDto, files: Array<Express.Multer.File>, userId: number) {
        return this.database.timeAttendance.update(id, {
            ...updateTimeKeepingDto,
            supportingDocuments: files.length !== 0 ? files.map((file) => file.filename).join(',') : null,
            updatedBy: userId,
        });
    }

    remove(id: number) {
        return this.database.timeAttendance.delete(id);
    }
}
