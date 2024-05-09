import * as XLSX from 'xlsx';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { HUMAN_DASHBOARD_TYPE } from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';
import { CacheService, TokenService, UtilService } from '~/shared/services';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { UserStorage } from '~/common/storages/user.storage';
import { DataSource, Not } from 'typeorm';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { Cell, Row } from 'exceljs';
import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Injectable()
export class HumanService {
    constructor(
        private readonly utilService: UtilService,
        private readonly database: DatabaseService,
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly departmentRepository: DepartmentRepository,
        private dataSource: DataSource,
    ) {}

    async accessControlHuman(): Promise<{ accessControlCondition: string; creatorCondition: string }> {
        const userId = UserStorage.getId();
        const departmentId = UserStorage.getDepartmentId();
        const positionGroupId = UserStorage.getPositionGroupId();
        const accessControlList = await this.database.documentAccessControl.getAccessControlListHuman('user', positionGroupId);
        let accessControl = null;
        console.log(accessControlList);

        // determines BOD if AC have null department id
        accessControlList.forEach((ac) => {
            if (!ac.departmentId) {
                accessControl = ac;
                return;
            }

            if (ac.departmentId === departmentId) {
                accessControl = ac;
                return;
            }

            return;
        });

        let userIds = [];
        let accessControlCondition = null; // list for department/position
        // list for creator and current approver, also previous approver
        const creatorCondition = `(
            entity.id = ${userId}
        )`;

        console.log(userId, departmentId, positionGroupId, accessControl);

        if (accessControl) {
            switch (true) {
                case accessControl.canViewAllDepartments:
                    accessControlCondition = `1 = 1`;
                    break;
                case accessControl.canViewSpecificDepartment:
                    userIds = await this.database.user.getUsersInDepartments(accessControl.departmentIds);
                    break;
                case accessControl.canViewOwnDepartment:
                    accessControlCondition = `entity.departmentId = ${departmentId}`;
                    break;
                default:
                    break;
            }

            if (userIds.length > 0) accessControlCondition = `entity.id IN (${userIds.join(',')})`;
        }

        return {
            accessControlCondition,
            creatorCondition,
        };
    }

    async create(createHumanDto: CreateHumanDto, avatar: Express.Multer.File) {
        const { password, ...rest } = createHumanDto;
        const accountExist = await this.database.account.countBy({ username: createHumanDto.code });
        if (accountExist) {
            throw new HttpException('Tài khoản có mã nhân sự đã tồn tại', 400);
        }
        if (createHumanDto.email) {
            const userExist = await this.database.user.countBy({ email: createHumanDto.email });
            if (userExist) {
                throw new HttpException('Tài khoản có email đã tồn tại', 400);
            }
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { salt, hash } = this.tokenService.hashPassword(password);
            const account = await queryRunner.manager.save(
                this.database.account.create({
                    username: createHumanDto.code,
                    password: hash,
                    salt,
                }),
            );

            const media = await this.utilService.handleUploadedFilev2(avatar, UserStorage.getId().toString(), '');

            const user = await queryRunner.manager.save(
                this.database.user.create({
                    ...rest,
                    ...(media && { avatar: media }),
                    createdById: UserStorage.getId(),
                    accountId: account.id,
                }),
            );

            await queryRunner.commitTransaction();

            return user;
        } catch (err) {
            await queryRunner.rollbackTransaction();

            throw new HttpException('Tạo tài khoản thất bại', 400);
        }
    }

    async findAll(queries: FilterDto) {
        return this.utilService.getList({
            repository: this.database.user,
            queries,
            builderAdditional: async (builder) => {
                // change to `rawQuerySearch` if entity don't have fulltext indices
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['fullName', 'phoneNumber', 'province'], keyword: queries.search }));
                // if (!this.utilService.isEmpty(queries.departmentId)) {
                //     builder.andWhere('entity.departmentId IN (:...departmentId)', { departmentId: queries.departmentId.split(',') });
                // }

                if (UserStorage.getLevel() !== 0) {
                    const conditions = await this.accessControlHuman();
                    console.log(conditions);

                    builder.andWhere(conditions.creatorCondition);
                    if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);
                }

                builder.leftJoinAndSelect('entity.position', 'position');
                builder.leftJoinAndSelect('entity.department', 'department');

                builder.select(['entity', 'position.name', 'department.id', 'department.name']);
            },
        });
    }

    async findAllByDepartment(queries: FilterDto, req: Request) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.departmentRepository, queries);

        const departments = builder.select(['entity']);
        builder.leftJoinAndSelect('entity.users', 'users');
        builder.andWhere('users.id IS NOT NULL');
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['users.fullName'], keyword: queries.search }));
        const [result, total] = await departments.getManyAndCount();

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

    async findAllByPositionGroup(queries: FilterDto, req: Request) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.user, queries);

        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['fullName'], keyword: queries.search }));
        builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'position', positionGroupId: req.headers['_positionGroupId'] }));

        builder.leftJoinAndSelect('entity.position', 'position');

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

    async findAllByIsManager(queries: FilterDto & { isManager: number }) {
        return this.utilService.getList({
            repository: this.database.user,
            queries,
            builderAdditional: async (builder) => {
                builder.andWhere(this.utilService.rawQuerySearch({ fields: ['fullName'], keyword: queries.search }));
                builder.andWhere(this.utilService.relationQuerySearch({ entityAlias: 'positionGroup', isManager: queries.isManager }));
                // if (!this.utilService.isEmpty(queries.departmentId)) {
                //     builder.andWhere('entity.departmentId IN (:...departmentId)', { departmentId: queries.departmentId.split(',') });
                // }

                const conditions = await this.accessControlHuman();
                console.log(conditions);

                builder.andWhere(conditions.creatorCondition);
                if (conditions.accessControlCondition) builder.orWhere(conditions.accessControlCondition);

                builder.leftJoinAndSelect('entity.position', 'position');
                builder.leftJoinAndSelect('position.positionGroup', 'positionGroup');

                builder.select(['entity']);
            },
        });
    }

    findOne(id: number) {
        const builder = this.database.user.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    async update(id: number, updateHumanDto: UpdateHumanDto, avatar: Express.Multer.File) {
        const { password, ...rest } = updateHumanDto;
        if (updateHumanDto.email) {
            const userExist = await this.database.user.countBy({ email: updateHumanDto.email, id: Not(id) });
            if (userExist) {
                throw new HttpException('Tài khoản có email đã tồn tại', 400);
            }
        }
        const human = await this.database.user.findOneBy({ id });
        const accountExist = await this.database.account.countBy({ username: updateHumanDto.code, id: Not(human.accountId) });
        if (accountExist) {
            throw new HttpException('Tài khoản có mã nhân sự đã tồn tại', 400);
        }
        const headOfDepartmentExist = await this.database.department.findOneBy({ headOfDepartmentId: id });
        if (headOfDepartmentExist && headOfDepartmentExist.id !== updateHumanDto.departmentId) {
            throw new HttpException('Nhân sự không thể vừa là trưởng phòng của phòng ban này vừa là nhân viên của phòng ban khác', 400);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (human.code !== updateHumanDto.code) {
                await queryRunner.manager.update(
                    AccountEntity,
                    { id: human.accountId },
                    {
                        username: updateHumanDto.code,
                    },
                );
            }
            if (password) {
                const { salt, hash } = this.tokenService.hashPassword(password);

                await queryRunner.manager.update(
                    AccountEntity,
                    { id: human.accountId },
                    {
                        password: hash,
                        salt,
                    },
                );
            }

            const media = await this.utilService.handleUploadedFilev2(avatar, UserStorage.getId().toString(), '');

            if (media && avatar && avatar.filename) {
                const filePath = `.${human.avatar}`;
                this.utilService.removeFile(filePath);
            }

            const user = await queryRunner.manager.update(UserEntity, id, {
                ...rest,
                ...(media && { avatar: media }),
                updatedById: UserStorage.getId(),
            });

            await queryRunner.commitTransaction();

            this.cacheService.delete(`userData:${id}`);

            return user;
        } catch (err) {
            await queryRunner.rollbackTransaction();

            throw new HttpException('Tạo tài khoản thất bại', 400);
        }
    }

    async remove(id: number) {
        const user = await this.database.user.findOneBy({ id });
        await this.database.account.delete(user.accountId);

        if (user && user.avatar) {
            const filePath = `.${user.avatar}`;
            this.utilService.removeFile(filePath);
        }

        return this.database.user.delete(id);
    }

    async dashboard(queries: FilterDto, type: string) {
        const { page, perPage, sortBy } = queries;
        if (type === HUMAN_DASHBOARD_TYPE.SEX) {
            return this.database.user.getStatisBySex();
        }

        if (type === HUMAN_DASHBOARD_TYPE.SENIORITY) {
            return this.database.user.getStatisBySeniority();
        }

        if (type === HUMAN_DASHBOARD_TYPE.BY_MONTH) {
            return this.database.user.getStatisByMonth(page, perPage, sortBy);
        }

        throw new BadRequestException('Loại thống kê không hợp lệ!');
    }

    async export(res: any) {
        const content = fs.readFileSync(path.join(process.cwd(), '/public/templates/export_human.xlsx'));
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(content);

        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        const workSheet = workbook.getWorksheet('Sheet1');

        const list = await this.database.user.find();

        let row;
        let indexRow = 5;
        let count = 1;

        for (const item of list) {
            row = workSheet.getRow(indexRow);

            const order = row.getCell(1);
            order.value = count;

            const code = row.getCell(2);
            code.value = item.code;

            const fullName = row.getCell(3);
            fullName.value = item.fullName;

            const anotherName = row.getCell(4);
            anotherName.value = item.anotherName;

            const birthDay = row.getCell(5);
            birthDay.value = moment(item.birthDay).format('DD/MM/YYYY');

            const placeOfBirth = row.getCell(6);
            placeOfBirth.value = item.placeOfBirth;

            const sex = row.getCell(7);
            sex.value = item.sex === 0 ? 'Nam' : 'Nữ';

            const identityNumber = row.getCell(8);
            identityNumber.value = item.identityNumber;

            const identityDate = row.getCell(9);
            identityDate.value = item.identityDate;

            const identityPlace = row.getCell(10);
            identityPlace.value = item.identityPlace;

            const email = row.getCell(11);
            email.value = item.email;

            const phoneNumber = row.getCell(12);
            phoneNumber.value = item.phoneNumber;

            const passportNumber = row.getCell(13);
            passportNumber.value = item.passportNumber;

            count++;
            indexRow++;
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'export_human.xlsx');
        await workbook.xlsx.write(res);

        return res.end();
    }
}
