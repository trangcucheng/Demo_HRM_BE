import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UserStorage } from '~/common/storages/user.storage';

@Injectable()
export class TaskService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createTaskDto: CreateTaskDto) {
        const { attachmentIds, ...rest } = createTaskDto;

        const task = await this.database.task.save(
            this.database.task.create({
                ...rest,
                createdById: UserStorage.getId(),
            }),
        );

        if (!this.utilService.isEmpty(attachmentIds)) this.database.task.addAttachments(task.id, attachmentIds);

        return task;
    }

    async findAll(queries: FilterDto & { status: string; departmentIdOfHuman: string }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.task, queries);

        builder.leftJoinAndSelect('entity.assignee', 'assignee');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('assignee.department', 'department');

        // Filter tasks based on departmentIdOfHuman
        if (queries.departmentIdOfHuman) {
            builder.andWhere('department.id = :departmentIdOfHuman', { departmentIdOfHuman: queries.departmentIdOfHuman });
        }

        // change to `rawQuerySearch` if entity don't have fulltext indices
        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['status']));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.select(['entity', 'createdBy.id', 'createdBy.fullName', 'assignee.id', 'assignee.fullName', 'department.id', 'department.name']);

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
        const builder = this.database.task.createQueryBuilder('entity');

        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('entity.assignee', 'assignee');
        builder.leftJoinAndSelect('entity.coordinator', 'coordinator');
        builder.leftJoinAndSelect('entity.attachments', 'attachments');
        builder.where({ id });

        builder.select([
            'entity',
            'createdBy.id',
            'createdBy.fullName',
            'assignee.id',
            'assignee.fullName',
            'coordinator.id',
            'coordinator.fullName',
            'attachments.id',
            'attachments.name',
            'attachments.path',
        ]);

        return builder.getOne();
    }

    async update(id: number, updateTaskDto: UpdateTaskDto) {
        const { attachmentIds, ...rest } = updateTaskDto;

        const task = await this.database.task.update(id, {
            ...rest,
            updatedById: UserStorage.getId(),
        });

        if (!this.utilService.isEmpty(attachmentIds)) {
            await this.database.task.removeAllAttachments(id);
            await this.database.task.addAttachments(id, attachmentIds);
        }

        return task;
    }

    remove(id: number) {
        return this.database.task.delete(id);
    }
}
