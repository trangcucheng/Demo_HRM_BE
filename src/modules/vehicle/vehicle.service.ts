import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createVehicleDto: CreateVehicleDto) {
        return this.database.vehicle.save(this.database.vehicle.create(createVehicleDto));
    }

    async findAll(queries: FilterDto) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.vehicle, queries);

        // change to `rawQuerySearch` if entity don't have fulltext indices
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
        const builder = this.database.vehicle.createQueryBuilder('entity');
        builder.where({ id });
        return builder.getOne();
    }

    update(id: number, updateVehicleDto: UpdateVehicleDto) {
        return this.database.vehicle.update(id, updateVehicleDto);
    }

    remove(id: number) {
        return this.database.vehicle.delete(id);
    }

    async history(queries: FilterDto & { vehicleId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.repairRequest, queries);

        builder.andWhere(this.utilService.getConditionsFromQuery(queries, ['vehicleId']));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name', 'vehicle.registrationNumber'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('vehicle.user', 'vehicleUser');
        builder.leftJoinAndSelect('vehicleUser.department', 'vuDepartment');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('repairBy.department', 'rbDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'vehicleUser.id',
            'vehicleUser.fullName',
            'vuDepartment.id',
            'vuDepartment.name',
            'repairBy.id',
            'repairBy.fullName',
            'rbDepartment.id',
            'rbDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
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

    historyDetail(vehicleId: number, repairRequestId: number) {
        const builder = this.database.repairRequest.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.vehicle', 'vehicle');
        builder.leftJoinAndSelect('vehicle.user', 'vehicleUser');
        builder.leftJoinAndSelect('vehicleUser.department', 'vuDepartment');
        builder.leftJoinAndSelect('entity.details', 'details');
        builder.leftJoinAndSelect('details.replacementPart', 'replacementPart');
        builder.leftJoinAndSelect('entity.progresses', 'progresses');
        builder.leftJoinAndSelect('progresses.repairBy', 'progressRepairBy');
        builder.leftJoinAndSelect('entity.repairBy', 'repairBy');
        builder.leftJoinAndSelect('repairBy.department', 'rbDepartment');
        builder.leftJoinAndSelect('entity.createdBy', 'createdBy');
        builder.leftJoinAndSelect('createdBy.department', 'cbDepartment');
        builder.leftJoinAndSelect('entity.images', 'images');

        builder.select([
            'entity',
            'vehicle.id',
            'vehicle.registrationNumber',
            'vehicleUser.id',
            'vehicleUser.fullName',
            'vuDepartment.id',
            'vuDepartment.name',
            'details',
            'replacementPart.id',
            'replacementPart.name',
            'replacementPart.quantity',
            'progresses',
            'progressRepairBy.id',
            'progressRepairBy.fullName',
            'repairBy.id',
            'repairBy.fullName',
            'rbDepartment.id',
            'rbDepartment.name',
            'createdBy.id',
            'createdBy.fullName',
            'cbDepartment.id',
            'cbDepartment.name',
            'images.path',
        ]);

        builder.where({ id: repairRequestId, vehicleId });
        return builder.getOne();
    }
}
