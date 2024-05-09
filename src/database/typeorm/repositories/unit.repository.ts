/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';

@Injectable()
export class UnitRepository extends Repository<UnitEntity> {
    constructor(private dataSource: DataSource) {
        super(UnitEntity, dataSource.createEntityManager());
    }

    async findOrCreate(name: string) {
        let entity = (await this.query(`SELECT id, name FROM units WHERE LOWER(name) = '${name.toLowerCase()}'`))?.[0];
        if (!entity) {
            entity = await this.save(this.create({ name }));
        }

        return entity;
    }
}
