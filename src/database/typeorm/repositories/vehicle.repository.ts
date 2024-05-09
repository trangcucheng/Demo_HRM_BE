/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { VehicleEntity } from '~/database/typeorm/entities/vehicle.entity';

@Injectable()
export class VehicleRepository extends Repository<VehicleEntity> {
    constructor(private dataSource: DataSource) {
        super(VehicleEntity, dataSource.createEntityManager());
    }

    async findOrCreate(registrationNumber: string) {
        const vehicle = await this.findOne({ where: { registrationNumber } });
        if (vehicle) return vehicle;
        return this.save(this.create({ registrationNumber, name: registrationNumber }));
    }
}
