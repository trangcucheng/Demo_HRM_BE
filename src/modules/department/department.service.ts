import { HttpException, Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UtilService } from '~/shared/services';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { MediaService } from '~/modules/media/media.service';

@Injectable()
export class DepartmentService {
    constructor(
        private readonly departmentRepository: DepartmentRepository,
        private readonly userRepository: UserRepository,
        private readonly mediaService: MediaService,
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
    ) {}

    async create(createDepartmentDto: CreateDepartmentDto) {
        const { code, headOfDepartmentId, ...rest } = createDepartmentDto;
        const departmentExist = await this.database.department.countBy({ code });
        const userExist = await this.database.user.findOneBy({ id: headOfDepartmentId });
        if (departmentExist) {
            throw new HttpException('Mã phòng ban đã tồn tại', 400);
        }
        if (!userExist) {
            throw new HttpException('Nhân viên không tồn tại', 400);
        } else {
            if (userExist.departmentId) {
                throw new HttpException('Nhân viên đã thuộc phòng ban khác', 400);
            }
        }
        const departmentCurrent = await this.departmentRepository.save(this.departmentRepository.create(createDepartmentDto));
        await this.database.user.update(userExist.id, { departmentId: departmentCurrent.id });
        return departmentCurrent;
        // return userExist
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.departmentRepository, queries);

        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.avatar', 'avatar');
        builder.leftJoinAndSelect('entity.users', 'users');
        builder.leftJoinAndSelect('entity.parent', 'parent');
        builder.leftJoinAndSelect('entity.children', 'children');
        builder.leftJoinAndSelect('entity.headOfDepartment', 'headOfDepartment');
        builder.leftJoinAndSelect('entity.departmentTasks', 'departmentTasks');
        builder.leftJoinAndSelect('entity.assets', 'assets');
        builder.leftJoinAndSelect('entity.documents', 'documents');
        builder.leftJoinAndSelect('entity.sendDocuments', 'sendDocuments');
        builder.leftJoinAndSelect('entity.textEmbryos', 'textEmbryos');

        builder.select([
            'entity',
            'avatar',
            'parent',
            'children',
            'users',
            'headOfDepartment',
            'departmentTasks',
            'assets',
            'documents',
            'sendDocuments',
            'textEmbryos',
        ]);

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

    private buildTree(departments: any[], level: number = 0): any[] {
        const tree = [];
        const map = {};

        for (const department of departments) {
            map[department.id] = department;
            department.children = []; // Khởi tạo mảng children trống cho mỗi phòng ban
        }

        for (const department of departments) {
            const parent = map[department.parentId];
            if (parent) {
                parent.children.push(department); // Thêm phòng ban vào mảng children của phòng ban cha
            } else {
                department.level = level;
                tree.push(department); // Nếu không có parentId thì đây là node gốc
            }
        }

        // Gọi đệ quy để cập nhật level cho các nút con
        for (const department of tree) {
            this.updateChildrenLevel(department, 1);
        }

        return tree;
    }

    private updateChildrenLevel(node: any, level: number): void {
        for (const child of node.children) {
            child.level = level;
            this.updateChildrenLevel(child, level + 1);
        }
    }

    async getListTypeTree(queries: FilterDto) {
        const builder = this.departmentRepository.createQueryBuilder('entity');
        builder.addSelect('CASE WHEN entity.parentId IS NULL THEN 0 ELSE 1 END', 'isRoot');
        builder.leftJoinAndSelect('entity.avatar', 'avatar');
        builder.leftJoinAndSelect('entity.users', 'users');
        builder.leftJoinAndSelect('entity.parent', 'parent');
        builder.leftJoinAndSelect('entity.children', 'children');
        builder.leftJoinAndSelect('entity.headOfDepartment', 'headOfDepartment');
        builder.leftJoinAndSelect('entity.departmentTasks', 'departmentTasks');
        builder.leftJoinAndSelect('entity.assets', 'assets');
        builder.leftJoinAndSelect('entity.documents', 'documents');
        builder.leftJoinAndSelect('entity.sendDocuments', 'sendDocuments');
        builder.leftJoinAndSelect('entity.textEmbryos', 'textEmbryos');
        builder.orderBy({ 'entity.id': 'ASC' });

        const [result] = await builder.getManyAndCount();

        return { data: this.buildTree(result) };
    }

    findOne(id: number) {
        return this.departmentRepository.findOneDepartmentWithAllRelationsById(id);
    }

    async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
        const { code, headOfDepartmentId, ...rest } = updateDepartmentDto;
        const departmentExist = await this.database.department.countBy({ code });
        const userExist = await this.database.user.findOneBy({ id: headOfDepartmentId });
        const department = await this.database.department.findOneBy({ id });
        if (code && code !== department.code && departmentExist) {
            throw new HttpException('Mã phòng ban đã tồn tại', 400);
        }
        if (headOfDepartmentId && headOfDepartmentId !== department.headOfDepartmentId) {
            if (!userExist) {
                throw new HttpException('Nhân viên không tồn tại', 400);
            } else {
                if (userExist.departmentId) {
                    throw new HttpException('Nhân viên đã thuộc phòng ban khác', 400);
                } else {
                    await this.database.user.update(department.headOfDepartmentId, { departmentId: null });
                    await this.database.user.update(userExist.id, { departmentId: department.id });
                }
            }
        }
        return this.departmentRepository.update(id, updateDepartmentDto);
    }

    async remove(id: number) {
        // set null for all user in this department
        const department = await this.database.department.findOneBy({ id });
        const userCurrent = await this.database.user.findOneBy({ id: department.headOfDepartmentId });
        if (userCurrent) {
            userCurrent.departmentId = null;
            await this.userRepository.save(userCurrent);
        }
        if (!department) {
            throw new HttpException('Không tìm thấy phòng ban', 404);
        }

        if (department.avatarId) {
            await this.mediaService.remove(department.avatarId);
        }

        const departmentChildrent = await this.database.department.find({ where: { parentId: id } });

        if (departmentChildrent && departmentChildrent.length > 0) {
            for (const childDepartment of departmentChildrent) {
                childDepartment.parentId = null;
                await this.departmentRepository.save(childDepartment);
            }
        }

        return this.departmentRepository.delete(id);
    }
}
