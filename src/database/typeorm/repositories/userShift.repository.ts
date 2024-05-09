/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserShiftEntity } from '~/database/typeorm/entities/userShift.entity';

@Injectable()
export class UserShiftRepository extends Repository<UserShiftEntity> {
    constructor(private dataSource: DataSource) {
        super(UserShiftEntity, dataSource.createEntityManager());
    }

    findOneUserShiftWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: ['user', 'shift'],
        });
    };

    findAllUserByShiftId = (id: number) => {
        return this.findOne({
            where: { shiftId: id },
            relations: ['user', 'shift'],
        });
    };
}
