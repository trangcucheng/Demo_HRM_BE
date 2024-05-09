import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<RoleEntity> {
    constructor(private dataSource: DataSource) {
        super(RoleEntity, dataSource.createEntityManager());
    }

    async removePermissions(roleId: number) {
        const permissions = await this.createQueryBuilder().relation('permissions').of(roleId).loadMany();

        return this.createQueryBuilder().relation('permissions').of(roleId).remove(permissions);
    }
}
