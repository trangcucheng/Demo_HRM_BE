/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';

@Injectable()
export class PositionRepository extends Repository<PositionEntity> {
    constructor(private dataSource: DataSource) {
        super(PositionEntity, dataSource.createEntityManager());
    }

    findOnePositiontWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: ['contracts', 'positionGroup', 'roles', 'roles.permissions'],
        });
    };

    addRoles(positionId: number, roleIds: number[]) {
        if (!roleIds || roleIds?.length === 0) {
            return Promise.resolve();
        }

        return this.query(
            `
            INSERT INTO roles_positions (role_id, position_id)
            VALUES ${roleIds.map((roleId) => `(${roleId}, ${positionId})`).join(', ')}
        `,
        );
    }

    removeRoles(positionId: number) {
        return this.query(`DELETE FROM roles_positions WHERE position_id = ${positionId}`);
    }
}
